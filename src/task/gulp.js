let mainConfig = null
const chalk = require('chalk')
const gulp = require('gulp')
const path = require('path')
const less = require('gulp-less')
const gulpMinifyCss = require('gulp-minify-css')
const rename = require('gulp-rename')
const autoprefixer = require('gulp-autoprefixer')

function minifyCss (config) {
  return new Promise((resolve, reject) => {
    let styleArr = [
      path.join(config.projectPath, config.tpls, 'style.less'),
      path.join(config.projectPath, config.tpls, 'add-common.less'),
      path.join(config.projectPath, config.tpls, 'common.less')
    ]

    gulp.src(styleArr)
      .pipe(less())
      .pipe(autoprefixer({
        browsers: ['last 2 versions', 'iOS >= 7', 'Firefox >= 20'],
        cascade: false
      }))
      .pipe(gulpMinifyCss())
      .pipe(rename(function (path) {
        path.extname = path.extname.replace('.css', '.min.css')
      }))
      .pipe(gulp.dest(path.join(config.projectPath, config.tpls)))
      .on('end', () => {
        resolve()
      })
      .on('error', (err) => {
        console.error(err)
        reject(err)
      })
  })
}

const uglify = require('gulp-uglify')
const ngAnnotate = require('gulp-ng-annotate')

function uglifyConfig (config) {
  return new Promise((resolve, reject) => {
    gulp.src([
      path.join(config.projectPath, config.src, 'config.js'),
      path.join(config.projectPath, config.src, 'init.js')])
      .pipe(ngAnnotate())
      .pipe(uglify())
      .pipe(rename(function (path) {
        path.extname = path.extname.replace('.js', '.min.js')
      }))
      .pipe(gulp.dest(path.join(config.projectPath, config.src)))
      .on('end', () => {
        resolve()
      })
      .on('error', (err) => {
        console.error(err)
        reject(err)
      })
  })
}

const concat = require('gulp-concat')
const babel = require('gulp-babel')

function concatAllJs (config) {
  return new Promise((resolve, reject) => {
    gulp.src(path.join(config.projectPath, config.tpls, '**/*.js'))
      .pipe(concat('app.js'))
      .pipe(babel({ compact: false }))
      .pipe(ngAnnotate())
      .pipe(uglify())
      .pipe(gulp.dest(path.join(config.projectPath, config.src)))
      .on('end', () => {
        resolve()
      })
      .on('error', (err) => {
        console.error(err)
        reject(err)
      })
  })
}

function copyFile (config) {
  return new Promise((resolve, reject) => {
    let destPath = config.publish.destPath

    let copy = config.publish.copy

    Promise.all(copy.map(function (item) {
      return new Promise((resolve, reject) => {
        let dest; let temp = item.match(/.\\src\\([\w\.-]+)/)[1]

        if (/\./.test(temp)) {
          dest = destPath
        } else {
          dest = path.join(destPath, `/${temp}`)
        }

        gulp.src(item).pipe(gulp.dest(dest)).on('end', () => {
          resolve()
        }).on('error', (err) => {
          console.error(err)
          reject(err)
        })
      })
    })).then(() => {
      resolve()
    }, (err) => {
      console.error(err)
      reject(new Error())
    })
  })
}

const fs = require('fs')
const http = require('http')
const crypto = require('crypto')

function modifyIndex (config) {
  return new Promise((resolve, reject) => {
    let indexSrc = config.publish.index

    // 获取index页面的内容
    function getIndexContent () {
      return fs.readFileSync(indexSrc).toString()
    }

    // 删除index页面中带有data-temp-file临时文件的引用
    let removeTempRefer = (function () {
      let con = getIndexContent().replace(/\s*<script.*\s*data-temp-file><\/script>/g, '')
      fs.writeFileSync(indexSrc, con)
    }())

    // 增加index页面中的 app.js
    let addAppJs = (function () {
      let con = getIndexContent()
        .replace('</head>', '\t<script src="app.js"></script>\r\n' + '</head>')
      fs.writeFileSync(indexSrc, con)
    }())

    // 获取packages中的JSON
    let getPackagesWxJson = (function () {
      http.get(config.packages.wxConcatJson, function (res) {
        const statusCode = res.statusCode
        const contentType = res.headers['content-type']

        let error
        if (statusCode !== 200) {
          error = new Error(`Request Failed.\n` +
            `Status Code: ${statusCode}`)
        } else if (!/^application\/json/.test(contentType)) {
          error = new Error(`Invalid content-type.\n` +
            `Expected application/json but received ${contentType}`)
        }
        if (error) {
          console.log(error.message)
          // consume response data to free up memory
          res.resume()
          return
        }

        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', (chunk) => rawData += chunk)
        res.on('end', () => {
          try {
            let parsedData = JSON.parse(rawData)
            changeIndexRefer(parsedData)
          } catch (e) {
            console.log(e.message)
          }
        })
      }).on('error', (e) => {
        console.log(`Got error: ${e.message}`)
      })
    }())

    // 根据json配置替换 dist 文件夹中index.html页面的引用
    function changeIndexRefer (data) {
      let i, source, temp
      let conMin = getIndexContent()
        .replace(/(\.js["']|\.css["'])\s+data-nd-cp/g, '.min$1')

      source = data.js.source
      for (i = 0; i < source.length; i++) {
        if (source[i] == '') {
          continue
        }
        temp = '<script src="http://package.jjiehao.com' +
          source[i].replace(/^\./, '') + '"></script>'
        if (new RegExp(temp).test(conMin)) {
          if (i === source.length - 1) {
            conMin = conMin.replace(
              new RegExp(temp), '<script src="http://package.jjiehao.com' +
              data.js.dest.replace(/^\./, '') + '/' + data.js.newName +
              '"></script>')
          } else {
            conMin = conMin.replace(new RegExp('\\s*' + temp), '')
          }
        } else {
          return reject(`${temp} 文件引用不对`)
        }
      }
      source = data.css.source
      for (i = 0; i < source.length; i++) {
        if (source[i] == '') {
          continue
        }
        temp = '<link\\s*rel="stylesheet"\\s*href="http://package.jjiehao.com' + source[i].replace(/^\./, '') + '">'
        if (new RegExp(temp).test(conMin)) {
          if (i === source.length - 1) {
            conMin = conMin.replace(new RegExp(temp),
              '<link rel="stylesheet" href="http://package.jjiehao.com' +
              data.css.dest.replace(/^\./, '') + '/' + data.css.newName + '">')
          } else {
            conMin = conMin.replace(new RegExp('\\s*' + temp), '')
          }
        } else {
          console.log(conMin)
          console.log(temp)
          return reject('css文件引用不对')
        }
      }

      // 引用 package 的文件加hash值
      conMin = conMin.replace(
        /src="http:\/\/package.jjiehao.com\/js\/(.*\.min\.js)/g,
        function (val, $1) {
          return val + '?v=' + data.md5Js[$1]
        })

      conMin = conMin.replace(
        /href="http:\/\/package.jjiehao.com\/css\/(.*\.min\.css)/g,
        function (val, $1) {
          return val + '?v=' + data.md5Css[$1]
        })

      // 相对地址 css 的文件加hash值
      for (let i = 0; i < config.customMd5.css.length; i++) {
        conMin = conMin.replace('href="tpls/' +
          config.customMd5.css[i], 'href="tpls/' + config.customMd5.css[i] +
          '?v=' + crypto.createHash('md5')
          .update(config.tpls + '/' + config.customMd5.css[i])
          .digest('hex')
          .slice(0, 10))
      }

      // 相对地址 js 的文件加hash值
      // 需要加前缀 不然会与 ueditor.config.min.js 冲突
      for (let i = 0; i < config.customMd5.js.length; i++) {
        conMin = conMin.replace('src="' + config.customMd5.js[i], 'src="' +
          config.customMd5.js[i] + '?v=' + crypto.createHash('md5')
          .update(config.src + '/' + config.customMd5.js[i])
          .digest('hex')
          .slice(0, 10))
      }

      fs.writeFileSync(indexSrc, conMin)

      resolve()
    }
  })
}

const inquirer = require('inquirer')
const ora = require('ora')
const execSync = require('child_process').execSync

function execPublish (fn, config) {
  return new Promise((resolve) => {
    let it = fn(config)

    function run (result) {
      if (result.done) {
        resolve()
        return result.value
      }

      return result.value.then(() => {
        return run(it.next())
      }, (err) => {
        console.log(chalk.gray.bgRed.bold(`发布流程出现故障！${err || ''}`))
        return run(it.throw(err))
      })
    }

    run(it.next())
  })
}

function * pulish () {
  yield (function () {
    return new Promise((resolve, reject) => {
      let spinner = ora('开始svn更新项目').start()

      let res = execSync('svn update', {
        cwd: mainConfig.projectPath
      }).toString()

      if (res.indexOf('Summary of conflicts') === -1) {
        spinner.succeed('svn更新项目成功!')
        resolve()
      } else {
        spinner.fail('svn更新遇到冲突，请解决后再发布!')
        reject()
      }
    })
  }())

  yield (function () {
    return new Promise((resolve, reject) => {
      let spinner = ora('开始编译css文件').start()

      minifyCss(mainConfig).then(() => {
        spinner.succeed('css文件编译完成!')
        resolve()
      }, (err) => {
        console.error(err)
        reject()
      })
    })
  }())

  yield (function () {
    return new Promise((resolve, reject) => {
      let spinner = ora('开始编译配置文件').start()

      uglifyConfig(mainConfig).then(() => {
        spinner.succeed('配置文件编译完成!')
        resolve()
      }, (err) => {
        console.error(err)
        reject()
      })
    })
  }())

  yield (function () {
    return new Promise((resolve, reject) => {
      let spinner = ora('开始编译js文件').start()

      concatAllJs(mainConfig).then(() => {
        spinner.succeed('js文件编译完成!')
        resolve()
      }, (err) => {
        console.error(err)
        reject()
      })
    })
  }())

  yield (function () {
    return new Promise((resolve, reject) => {
      let spinner = ora('开始复制文件').start()

      copyFile(mainConfig).then(() => {
        spinner.succeed('文件复制完成!')
        resolve()
      }, (err) => {
        console.error(err)
        reject()
      })
    })
  }())

  yield (function () {
    return new Promise((resolve, reject) => {
      let spinner = ora('开始处理首页').start()

      modifyIndex(mainConfig).then(() => {
        spinner.succeed('首页处理完成!')
        resolve()
      }, (err) => {
        spinner.fail(err)
        reject()
      })
    })
  }())
}

function publish (config) {
  mainConfig = config

  execPublish(pulish).then(() => {
    inquirer.prompt([
      {
        type: 'confirm',
        message: '发布编译完成，是否上传？',
        name: 'upload'
      }]).then((answers) => {
      if (!answers.upload) return
      execSync(`E:/bin/rsync/rsync -avz --progress --exclude-from="${path.join(
        __dirname, '..', 'extension',
        'exclude.list')}" ./ bjbw@139.129.166.12::${mainConfig.publish.name}`, {
        cwd: mainConfig.publish.destPath, // 固定目录
        detached: true // 打开新窗口
      })
    })
  })
}

module.exports = {
  publish
}
