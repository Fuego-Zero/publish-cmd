const path          = require('path')
const ora           = require('ora')
const inquirer      = require('inquirer')
const child_process = require('child_process')
const execSync      = child_process.execSync
const spawn         = child_process.spawn

function upload (config) {

  inquirer.prompt([
    {
      type   : 'confirm',
      message: '发布编译完成，是否上传？',
      name   : 'upload',
    }]).then((answers) => {

    if (!answers.upload) return
    execSync(`E:/bin/rsync/rsync -avz --progress --exclude-from="${path.join(
      __dirname, '..', 'extension',
      'exclude.list')}" ./ bjbw@139.129.166.12::${config.publish.name}`, {
      cwd     : path.join(config.path, 'dist'),
      detached: true,
    })

  })

}

function publish (config) {

  let svnSpinner = ora('开始svn更新项目').start()

  let res = execSync('svn update', {
    cwd: config.path,
  }).toString()

  if (res.includes('Summary of conflicts')) {
    svnSpinner.fail('svn更新遇到冲突，请解决后再发布!')
    return
  } else {
    svnSpinner.succeed('svn更新项目成功!')
  }

  let node = spawn('node',
    ['build/build.js'], {
      cwd: config.path,
    })

  let nodeSpinner = ora('开始编译发布版本').start()

  let status = true

  node.stdout.on('data', function (data) {
    // console.log('stdout: ' + data)
  })

  node.stderr.on('data', function (data) {
    status = false
    console.log('stderr: ' + data)
    nodeSpinner.fail('编译出错!')
  })

  node.on('close', function (code) {
    // console.log('child process exited with code ' + code)
    status && nodeSpinner.succeed('编译完成!')
    upload(config)
  })

}

module.exports = {
  publish,
}
