const { port } = require('./web.config').server;
const Koa = require('koa')
const koabody = require('koa-body');//解析客户端请求内容
const responseHandler = require("koa-response-handler");//处理响应

const app = new Koa() // 创建koa应用程序实例

// 配置请求体的大小
app.use(koabody({
    multipart: true,
    formidable: {
        keepExtensions: true,
        maxFieldsSize: 2 * 1024 * 1024
    }
}));
// 默认响应json格式  
app.use(responseHandler({ contentType: 'application/json' }));
// 客户端身份识别
require("./authConfig").config(app);
// url与处理函数之间的映射
require("./routeConfig").config(app);

app.listen(port);
// zhushi
console.log(`\x1B[32mapp started at port ${port}\x1B[39m`);
