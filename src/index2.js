const ora          = require('ora');
const wechatApplet = require('./task/wechat-applet');
const config       = require('./project-config/config');

wechatApplet.publish(config.BJ_dining_xcx);