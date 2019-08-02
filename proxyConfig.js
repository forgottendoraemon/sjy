const proxy = require('http-proxy-middleware');
const url = require('url');

const { proxyPrefix, proxyServers } = require('./web.config').proxy;
/* http://localhost/proxy/api.map.baidu.com/place/v2 => http://api.map.baidu.com/place/v2 */

function isValid (serverConfig, turl) {
    if (serverConfig.host && turl.host !== serverConfig.host) return false;
    return true;
}

function validTargetUrl (target) {
    let turl = url.parse(target);
    return proxyServers.filter(t => isValid(t, turl)).length > 0;
}

function config (app) {
    app.use(async (ctx, next) => {
        if (ctx.url.startsWith(proxyPrefix)) {
            ctx.respond = false;
            let targetpath = ctx.url.substring(proxyPrefix.length);
            if (targetpath) {
                let target = `${ctx.protocol}://${targetpath}`;
                if (validTargetUrl(target)) {
                    return proxy({
                        target: target,
                        changeOrigin: true,
                        pathRewrite: () => targetpath
                    })(ctx.req, ctx.res, next);
                }
            }
        }
        await next();
    });
}

module.exports.config = config;