const inquirer = require('inquirer')
const gulp = require('./task/gulp')
const wechatApplet = require('./task/wechat-applet')
const wechatApplet2 = require('./task/wechat-applet2')
const vue = require('./task/vue')
const config = require('./project-config/config')

const type = [
  '定制项目',
  '公司项目'
]

const companyProject = {
  message: '请选择要发布的项目:',
  choices: [
    '百捷食堂PC后台',
    '商城小程序PC后台',
    '门店小程序PC后台',
    '极捷号PC后台',
    '百捷食堂小程序',
    '商城小程序',
    '外送版小程序',
    '门店版小程序'
  ],
  handle: {
    '百捷食堂PC后台' () {
      gulp.publish(config.BJ_dining_pc)
    },
    '百捷食堂小程序' () {
      wechatApplet.publish(config.BJ_dining_xcx)
    },
    '商城小程序' () {
      wechatApplet2.publish(config.shopWeChatApplet_dev)
    },
    '商城小程序PC后台' () {
      gulp.publish(config.shopXCX)
    },
    '极捷号PC后台' () {
      gulp.publish(config.JJH_PC)
    },
    '外送版小程序' () {
      wechatApplet.publish(config.shopStore_takeout_xcx)
    },
    '门店版小程序' () {
      wechatApplet.publish(config.shopStore_xcx)
    },
    '门店小程序PC后台' () {
      gulp.publish(config.shopStore_pc)
    }
  }
}

const cusotmProject = {
  message: '请选择要发布的项目:',
  choices: [
    '喜之丰小程序',
    '喜之丰PC后台',
    '秋知丰PC后台',
    '野孩子'
  ],
  handle: {
    '喜之丰小程序' () {
      wechatApplet.publish(config.hnqzf_WeChatApplet)
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
          'PC后台',
          '小程序'
        ],
        handle: {
          'PC后台' () {
            vue.publish(config.awildboyPC)
          },
          '小程序' () {
            wechatApplet.publish(config.awildboyXCX)
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
      handle(cusotmProject)
      break
    case '公司项目':
      handle(companyProject)
      break
  }
})

function handle ({choices, handle, message}) {
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
