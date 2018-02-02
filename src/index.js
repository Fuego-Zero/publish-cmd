const inquirer     = require('inquirer');
const gulp         = require('./task/gulp');
const wechatApplet = require('./task/wechat-applet');
const config       = require('./project-config/config');

const project = ['百捷食堂PC后台', '百捷食堂小程序', '商城小程序第20迭代', '商城小程序PC后台', '极捷号2.0 PC后台'];

inquirer.prompt([{
    type   : 'rawlist',
    message: '请选择要发布的版本:',
    name   : 'name',
    choices: project
}]).then((answers) => {

    switch (answers.name) {
        case '百捷食堂PC后台':
            gulp.publish(config.BJ_dining);
            break;
        case '百捷食堂小程序':
            wechatApplet.publish(config.BJ_dining_WeChatApplet);
            break;
        case '商城小程序第20迭代':
            wechatApplet.publish(config.ShopWeChatApplet_period_20);
            break;
        case '商城小程序PC后台':
            gulp.publish(config.shopXCX);
            break;
        case '极捷号2.0 PC后台':
            gulp.publish(config.JJH_PC);
            break;
    }

});
