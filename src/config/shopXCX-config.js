const path = require('path')
const fs = require('fs')
const src = 'src'
const tpls = path.join(src, 'tpls')

const projectPath = 'E:/work/shopXCX_publish'

let folderArr = (function () {
  return fs.readdirSync(path.join(projectPath, tpls)).filter(function (v) {
    return !/\.less|\.css|\.html|\.js|.map/.test(v)
  })
})()

module.exports = {
  projectPath,
  src,
  tpls,
  customMd5: {
    css: ['common.min.css', 'add-common.min.css', 'style.min.css'],
    js: ['init.min.js', 'config.min.js', 'app.js']
  },
  js: {
    src: folderArr,
    prodDest: './tempFile',
    destPath: src + '/tempFile'
  },
  publish: {
    destPath: 'E:/work/shopXCX_dist',
    name: 'shopxcx', // 服务器发布名称
    index: 'E:/work/shopXCX_dist/index.html',
    copy: [
      path.join(projectPath, src, 'customer/**/*'),
      path.join(projectPath, src, 'data/**/*'),
      path.join(projectPath, src, 'framework/**/*'),
      path.join(projectPath, src, 'images/**/*'),
      path.join(projectPath, src, 'pdf/**/*'),
      path.join(projectPath, src, 'app.js'),
      path.join(projectPath, src, 'config.min.js'),
      path.join(projectPath, src, 'index.html'),
      path.join(projectPath, src, 'init.min.js'),
      path.join(projectPath, tpls, '**/*.html'),
      path.join(projectPath, tpls, '**/*.json'),
      path.join(projectPath, tpls, '**/*.csv'),
      path.join(projectPath, tpls, 'common.min.css'),
      path.join(projectPath, tpls, 'add-common.min.css'),
      path.join(projectPath, tpls, 'style.min.css')
    ],
    someOtherFile: [path.join(projectPath, src, 'config.js'), path.join(projectPath, src, 'init.js')]
  },
  packages: {
    wxConcatJson: 'http://package.jjiehao.com/shop_xcx.json'
  }
}
