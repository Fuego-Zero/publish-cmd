const inquirer     = require('inquirer');
const gulp         = require('./task/gulp');
const wechatApplet = require('./task/wechat-applet');
const config       = require('./project-config/config');

const project = ['百捷食堂PC后台', '商城小程序PC后台', '门店小程序PC后台', '极捷号PC后台', '百捷食堂小程序', '商城小程序第20迭代', '外送版小程序', '门店版小程序'];

inquirer.prompt([{
    type   : 'rawlist',
    message: '请选择要发布的版本:',
    name   : 'name',
    choices: project
}]).then((answers) => {

    switch (answers.name) {
        case '百捷食堂PC后台':
            gulp.publish(config.BJ_dining_pc);
            break;
        case '百捷食堂小程序':
            wechatApplet.publish(config.BJ_dining_xcx);
            break;
        case '商城小程序第22迭代':
            wechatApplet.publish(config.shopWeChatApplet_period_20);
            break;
        case '商城小程序PC后台':
            gulp.publish(config.shopXCX);
            break;
        case '极捷号PC后台':
            gulp.publish(config.JJH_PC);
            break;
        case '外送版小程序':
            wechatApplet.publish(config.shopStore_takeout_xcx);
            break;
        case '门店版小程序':
            wechatApplet.publish(config.shopStore_xcx);
            break;
        case '门店小程序PC后台':
            gulp.publish(config.shopStore_pc);
            break;
    }

});

