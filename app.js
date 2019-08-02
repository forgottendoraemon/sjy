const { port } = require('./web.config').server;

const Koa = require('koa')
const koabody = require('koa-body');
const responseHandler = require("koa-response-handler");
const app = new Koa()

app.use(koabody({
    multipart: true,
    formidable: {
        keepExtensions: true,
        maxFieldsSize: 2 * 1024 * 1024
    }
}));
app.use(responseHandler({ contentType: 'application/json' }));
require("./authConfig").config(app);
require("./proxyConfig").config(app);
require("./routeConfig").config(app);
require("./renderConfig").config(app);

app.listen(port)
console.log(`\x1B[32mapp started at port ${port}\x1B[39m`);
