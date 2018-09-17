const moment = require('moment')
const fs = require('fs')
const statSync = fs.statSync
const path = require('path')
const archiver = require('archiver')
const ora = require('ora')
const execSync = require('child_process').execSync
const chalk = require('chalk')

let mainConfig = null

/**
 * 复制目录中的所有文件包括子目录
 *
 * @param src {String} 需要复制的目录
 * @param dst {String} 复制到指定的目录
 */
function copy (src, dst) {

  // 读取目录中的所有文件
  fs.readdirSync(src).forEach((path) => {

    let _src = src + '/' + path
    let _dst = dst + '/' + path

    let st = statSync(_src)
    // 判断是否为文件
    if (st.isFile() && !exclude(0, path)) {
      fs.copyFileSync(_src, _dst)
    }
    // 如果是目录则递归调用自身
    else if (st.isDirectory() && !exclude(1, path)) {
      exists(_src, _dst, copy)
    }

  })
}

/**
 * 删除目录中的所有文件包括子目录
 * @param dst
 */
function remove (dst) {

  fs.readdirSync(dst).forEach((path) => {

    let _dst = dst + '/' + path,
      st = statSync(_dst)

    if (st.isFile()) {
      fs.unlinkSync(_dst)
    } else if (st.isDirectory()) {
      remove(_dst)
    }

  })

  fs.rmdirSync(dst)

}

/**
 * 判断是否需要排除
 * @param type {number} 0-文件 1-文件夹
 * @param name {string}
 */
function exclude (type, name) {

  let temp = false

  if (type === 0) {

    temp = mainConfig.exclude.file.find((item) => {
      return item === name
    })

    if (!temp) {
      temp = mainConfig.exclude.extname.find((item) => {
        return path.extname(name) === item
      })
    }

  } else if (type === 1) {
    temp = mainConfig.exclude.directory.find((item) => {
      return item === name
    })
  }

  return temp

}

// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
function exists (src, dst, callback) {

  if (fs.existsSync(dst)) {
    // 已存在
    callback(src, dst)
  } else {
    // 不存在
    fs.mkdirSync(dst)
    callback(src, dst)
  }

}

/**
 * 把文件打包成压缩包
 * @param dst
 */
function packaging (dst) {
  return new Promise((resolve, reject) => {

    let output = fs.createWriteStream(`${dst}.zip`)
    let archive = archiver('zip')

    output.on('close', function () {
      ora(`已经打包完成，体积为:${archive.pointer()} bytes`).succeed()
      ora(`文件路径：${dst}`).succeed()
      resolve()
    })

    output.on('end', function () {
      console.log('Data has been drained')
    })

    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
      } else {
        throw err
        reject()
      }
    })

    archive.on('error', function (err) {
      throw err
    })

    archive.pipe(output)
    archive.directory(`${dst}`, false)
    archive.finalize()

  })
}

/**
 * 发布小程序
 * @param config {object} 配置文件对象
 */
function publish (config) {
  let spinner
  moment.locale('zh-cn')

  let time = moment().format('LLL'),
    src = config.path.src,
    name = config.name || path.basename(src),
    dst = path.join(config.path.dst, `${time} ${name} 送审`)
  mainConfig = config

  spinner = ora('开始svn更新项目').start()

  let res = execSync('svn update', {
    cwd: mainConfig.path.src
  }).toString()

  if (res.indexOf('Summary of conflicts') === -1) {
    spinner.succeed('svn更新项目成功!')
  } else {
    spinner.fail('svn更新遇到冲突，请解决后再发布!')
    return
  }

  spinner = ora('开始编译项目').start()

  let buildRes = execSync('gulp build', {
    cwd: mainConfig.path.src
  }).toString()

  if (buildRes.includes('项目初始化完成。')) {
    spinner.succeed('项目编译完成!')
  } else {
    spinner.fail('项目编译出错，请解决后再发布!')
    console.error(buildRes)
    return
  }

  exists(path.join(src, 'dist'), dst, copy)

  packaging(dst).then(() => {
    remove(dst)
  })

}

module.exports = {
  publish
}
