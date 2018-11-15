const inquirer = require('inquirer')
const gulp = require('./task/gulp')
const weChatApplet = require('./task/weChat-applet')
const xcx = require('./task/new.xcx')
const vue = require('./task/vue')
const config = require('./config/config')

const type = [
  '定制项目',
  '公司项目'
]

const companyProject = {
  message: '请选择要发布的项目:',
  choices: [
    '百捷食堂',
    '商城小程序',
    '门店小程序',
    '极捷号PC后台',
    '外送版小程序'
  ],
  handle: {
    '百捷食堂' () {
      handle({
        message: '请选择要发布的版本:',
        choices: [
          'PC端',
          '小程序'
        ],
        handle: {
          'PC端' () {
            gulp.publish(config.BJ_dining_pc)
          },
          '小程序' () {
            weChatApplet.publish(config.BJ_dining_xcx)
          }
        }
      })
    },
    '商城小程序' () {
      handle({
        message: '请选择要发布的版本:',
        choices: [
          'PC端',
          '微信小程序',
          '百度小程序'
        ],
        handle: {
          'PC端' () {
            gulp.publish(config.shopXCX)
          },
          '微信小程序' () {
            xcx.publish(config.shopWX_xcx)
          },
          '百度小程序' () {
            xcx.publish(config.shopBD_xcx)
          }
        }
      })
    },
    '门店小程序' () {
      handle({
        message: '请选择要发布的版本:',
        choices: [
          'PC端',
          '小程序'
        ],
        handle: {
          'PC端' () {
            gulp.publish(config.shopStore_pc)
          },
          '小程序' () {
            weChatApplet.publish(config.shopStore_xcx)
          }
        }
      })
    },
    '极捷号PC后台' () {
      gulp.publish(config.JJH_PC)
    },
    '外送版小程序' () {
      weChatApplet.publish(config.shopStore_takeout_xcx)
    }
  }
}

const customProject = {
  message: '请选择要发布的项目:',
  choices: [
    '喜之丰小程序',
    '喜之丰PC后台',
    '秋知丰PC后台',
    '野孩子'
  ],
  handle: {
    '喜之丰小程序' () {
      weChatApplet.publish(config.hnqzf_WeChatApplet)
    },
    '喜之丰PC后台' () {
      vue.publish(config.hnqzf_vue)
    },
    '秋知丰PC后台' () {
      vue.publish(config.whqzf_vue)
    },
    '野孩子' () {
      handle({
        message: '请选择要发布的版本:',
        choices: [
          'PC端',
          '小程序'
        ],
        handle: {
          'PC端' () {
            vue.publish(config.awildboyPC)
          },
          '小程序' () {
            xcx.publish(config.awildboyXCX)
          }
        }
      })
    }
  }
}

inquirer.prompt([
  {
    type: 'list',
    message: '请选择项目类型:',
    name: 'name',
    choices: type
  }]).then((answers) => {
  switch (answers.name) {
    case '定制项目':
      handle(customProject)
      break
    case '公司项目':
      handle(companyProject)
      break
  }
})

function handle ({ choices, handle, message }) {
  inquirer.prompt([
    {
      type: 'list',
      message,
      name: 'name',
      choices
    }]).then((answers) => {
    handle[answers.name]()
  })
}
