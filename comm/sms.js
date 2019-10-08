/**
 * 短信接口模块
 */

const axios = require('axios');

/**
 * 发送短信到指定的地址组
 * @param {*} numbers 目标号码数组
 * @param {*} body 内容
 */
async function send(numbers, body) {
    const result = await axios.post('http://47.103.35.11:7862/sms',
        encodeURI(`action=send&account=100059&password=C66z2D&mobile=${numbers.join(',')}&content=${body}&extno=10690100059&rt=json`)
    );
    if(result.data.status!=="0"){
        console.error(`短信发送失败 ${result.status} ${numbers.join(',')} ${body}`);
        throw `短信发送失败 ${result.status}`;
    }
    else{
        console.log(`短信发送成功${numbers.join(',')} ${body}`);
    }
}

module.exports = {
    send
}