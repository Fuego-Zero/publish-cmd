const fs = require('fs')
const path = require('path')

const dir = 'E:\\work\\shopXCX-xcx-dev-33\\dist'

const fileUrl = 'http://file.xcx.jjiehao.com'
const baseUrl = 'https://shop.xcx.jjiehao.com'

let appConfigPath = path.join(dir, 'app-config.js')
let appConfig = fs.readFileSync(appConfigPath).toString()

appConfig = appConfig.replace('http://file.dev.jjiehao.com', fileUrl)
appConfig = appConfig.replace('http://xcx.jjiehao.com', baseUrl)

fs.writeFileSync(appConfigPath, appConfig)

let appletConfigPath = path.join(dir, 'applet-config.js')
let appletConfig = fs.readFileSync(appletConfigPath).toString()

appletConfig = appletConfig.replace(/exports.default = \{[\s\S]*\}/g, 'exports.default = {}')

fs.writeFileSync(appletConfigPath, appletConfig)

let toolsPath = path.join(dir, 'utils', 'tools.wxs')

toolsPath = fs.existsSync(toolsPath) ? toolsPath : path.join(dir, 'utils', 'tools.filter.js')

if (fs.existsSync(toolsPath)) {
  let tools = fs.readFileSync(toolsPath).toString()

  tools = tools.replace('http://file.dev.jjiehao.com', fileUrl)

  fs.writeFileSync(toolsPath, tools)
} else {
  throw new Error('没有找到tools文件')
}
