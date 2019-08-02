/**
 * 封装邮件发送功能
 */

const nodemailer = require('nodemailer');
const { from, SMTPPassword, service, port, minInterval } = require('../web.config').emali;

const transporter = nodemailer.createTransport({
    service,
    port,
    secureConnection: true, // 使用 SSL
    auth: {
        user: from,
        pass: SMTPPassword
    }
});

/**
 * 记录发送时间
 * {[email:string]:number}
 */
const sendRecord = {};

/**
 * 发送邮件到指定的地址
 * @param {*} email 目标地址
 * @param {*} tile 标题
 * @param {*} html 正文HTML
 */
async function sendMail (email, tile, html) {
    const st = sendRecord[email];
    if (st && new Date().getTime() - st < minInterval) await delay(minInterval - (new Date().getTime() - st));
    sendRecord[email] = new Date().getTime();
    await transporter.sendMail({
        from,
        to: email,
        subject: tile,
        html
    });
}

async function delay (time) {
    if (time > 0) {
        return new Promise(r => setTimeout(r, time));
    }
}

module.exports = {
    sendMail
}