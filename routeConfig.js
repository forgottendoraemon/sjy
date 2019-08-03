function configStatic (app) {
    const staticFileHander = require("koa-static");

    // //首页由静态文件中间件在注册的静态文件目录中寻找到index.html
    // app.use(staticFileHander(`${__dirname}/HTMapMarkersystem/dist`, {
    //     maxAge: 1000 * 60 * 60 * 24 * 1 // 1天(dist/static/assets目录文件名不带hash值, 可能会造成修改后浏览器仍使用修改前的文件)
    // }));
    // app.use(staticFileHander(`${__dirname}/HTMapMarkersystem-Mobile/dist`));
    app.use(staticFileHander(`${__dirname}/static`));
}

/**
 * 控制器后缀(若控制器文件名称以此结尾则将移除此结尾后的名称作为控制器名)
 */
const ControllerSuffix = 'controller';

/**
 * 由控制器文件名映射到控制器名称
 * @param {*} filename 控制器文件名(*.js)
 */
function getControllerName (filename) {
    let controllerName = filename.substring(0, filename.length - 3);
    const dl = controllerName.length - ControllerSuffix.length;
    if (dl > 0 && controllerName.substring(dl).toLowerCase() === ControllerSuffix) {
        controllerName = controllerName.substring(0, dl);
    }
    return controllerName;
}

function configController (app) {
    const Router = require("koa-router");
    let router = new Router();

    addControllers(router);
    addApiControllers(router);

    app.use(router.routes()).use(router.allowedMethods());
}

/**
 * /mobile访问移动端页面
 * @param {*} app 
 */
function configMobile (app) {
    const Router = require("koa-router");
    let router = new Router();
    const send = require('koa-send');
    router.get('/mobile', async ctx => {
        await send(ctx, 'index.html', { root: `${__dirname}/HTMapMarkersystem-Mobile/dist` });
    });
    app.use(router.routes()).use(router.allowedMethods());
}

/*普通控制器简单路由绑定*/

function addMapping (router, mapping, controllerName) {
    let methods = ['get', 'post', 'put', 'delete'];
    for (var action in mapping) {
        let actionhandlerSrc = mapping[action];
        if (typeof (actionhandlerSrc) !== "function") continue;

        let actionLowerCase = action.toLowerCase();
        let method = methods.filter(t => actionLowerCase.startsWith(t))[0];
        //按前缀注册HTTP方法,默认get方法
        let actionName;
        if (method) {
            actionName = action.substring(method.length);
        }
        else {
            method = "get";
            actionName = action;
        }
        let path = `/${controllerName}/${actionName}`;

        //自定义路由
        if (actionhandlerSrc.routePath) {
            if (actionhandlerSrc.routePath.startsWith('/')) {
                path = actionhandlerSrc.routePath;
            }
            else {
                path = `/${controllerName}/${actionhandlerSrc.routePath}`;
            }
        }

        //统一处理错误
        let actionhandler;
        if (isAsyncFunction(actionhandlerSrc)) {
            actionhandler = async function (ctx, next) {
                try {
                    result = await actionhandlerSrc.apply(mapping, [ctx, next]);
                }
                catch (ex) {
                    let exm = ex.message || ex;
                    // ctx.response.ok({ error: true, message: exm });
                    ctx.response.badRequest(exm);
                }
            }
        }
        else {
            actionhandler = function (ctx, next) {
                try {
                    result = actionhandlerSrc.apply(mapping, [ctx, next]);
                }
                catch (ex) {
                    let exm = ex.message || ex;
                    // ctx.response.ok({ error: true, message: exm });
                    ctx.response.badRequest(exm);
                }
            }
        }

        router[method](path, actionhandler);

        console.log(`${method} ${path}`);
    }
}

function addControllers (router) {
    const fs = require('fs');
    var files = fs.readdirSync(__dirname + '/controllers');
    var js_files = files.filter((f) => {
        return f.endsWith('.js');
    });

    for (var f of js_files) {
        let controllerName = getControllerName(f);
        console.log(`\x1B[32mprocess controller: ${controllerName}\x1B[39m`);
        let mapping = require(__dirname + '/controllers/' + f);
        addMapping(router, mapping, controllerName);
    }
}


/* API控制器路由（带简单参数绑定） */
function addApiMapping (router, mapping, controllerName) {
    let methods = ['get', 'post', 'put', 'delete'];
    for (var action in mapping) {
        let actionLowerCase = action.toLowerCase();
        let method = methods.filter(t => actionLowerCase.startsWith(t))[0] || "get";
        let path = `/api/${controllerName}`;
        let actionhandler = mapping[action];
        let args = getFuncArguments(actionhandler);

        let actionhandlerSrc = mapping[action];

        // 自定义路由
        if (actionhandlerSrc.routePath) {
            if (actionhandlerSrc.routePath.startsWith('/')) {
                path = actionhandlerSrc.routePath;
            }
            else {
                path = `${path}/${actionhandlerSrc.routePath}`;
            }
        }
        // 自动路由
        else if (args.length) {
            // GET、PUT、DELETE方法可绑定URL参数
            if (method === "get" || method === "delete" || method === "put") {
                let getps = args.filter(a => !specialParameter[a]);
                if (getps.length) {
                    path = `/api/${controllerName}/${getps.map(p => `:${p}`).join('/')}`;
                }
            }
        }
        // 执行用户检查
        // 添加自动参数绑定 
        // 统一处理api方法的返回
        if (isAsyncFunction(actionhandlerSrc)) {
            actionhandler = async function (ctx, next) {
                try {
                    if (!ApiActionAuth(actionhandlerSrc, ctx)) {
                        ctx.response.unauthorized();
                        return;
                    }
                    let ps = apiParameterBind(ctx, args);
                    result = await actionhandlerSrc.apply(mapping, ps);
                    parseApiResult(method, result, ctx);
                }
                catch (ex) {
                    let exm = ex.message || ex;
                    // ctx.response.ok({ error: true, message: exm });
                    ctx.response.badRequest(exm);
                }
            }
        }
        else {
            actionhandler = function (ctx, next) {
                try {
                    if (!ApiActionAuth(actionhandlerSrc, ctx)) {
                        ctx.response.unauthorized();
                        return;
                    }
                    let ps = apiParameterBind(ctx, args);
                    result = actionhandlerSrc.apply(mapping, ps);
                    parseApiResult(method, result, ctx);
                }
                catch (ex) {
                    let exm = ex.message || ex;
                    // ctx.response.ok({ error: true, message: exm });
                    ctx.response.badRequest(exm);
                }
            }
        }

        router[method](path, actionhandler);
        console.log(`${method} ${path}`);
    }
}

function addApiControllers (router) {
    const fs = require('fs');
    var files = fs.readdirSync(__dirname + '/controllers/api');
    var js_files = files.filter((f) => {
        return f.endsWith('.js');
    });

    for (var f of js_files) {
        let controllerName = getControllerName(f);
        console.log(`\x1B[32mprocess controller: ${controllerName} \x1B[39m`);
        let mapping = require(__dirname + '/controllers/api/' + f);
        addApiMapping(router, mapping, controllerName);
    }
}

function getFuncArguments (func) {
    let fstr = func.toString();
    let argumentstr;
    if (func.length > 0) {
        if (fstr.startsWith('function')) {
            let s = fstr.indexOf('(');
            let e = fstr.indexOf(')');
            argumentstr = fstr.substring(s + 1, e);
        }
        else {
            if (fstr.startsWith('async')) fstr = fstr.substring(5);
            let e = fstr.indexOf('=>');
            argumentstr = fstr.substring(0, e).replace('(', '').replace(')', '');
        }
        return argumentstr.split(',').map(a => a.trim());
    }
    else {
        return [];
    }
}

function isAsyncFunction (func) {
    return func.toString().startsWith("async");
}

/* API返回值处理 */
const ApiResultparser = {
    get: (result, ctx) => {
        if (result === null) {
            ctx.response.notFound();
        }
        else {
            ctx.response.ok(result);
        }
    },
    post: (result, ctx) => {
        ctx.response.created(result);
    },
    put: (result, ctx) => {
        ctx.response.ok();
    },
    'delete': (result, ctx) => {
        ctx.response.ok();
    }
};

/**
 * 处理API控制器的基本权限检测
 * 返回false表示权限检测不通过
 * 默认api action需要登录才能访问
 * 配置publicVisit=true公开该action的访问
 * 配置share=true会读取请求中的shareid将其注入user对象
 * @param {*} action 
 * @param {*} ctx 
 */
function ApiActionAuth (action, ctx) {
    if (action.share) {
        const shareid = ctx.query.shareid || ctx.params.shareid || ctx.request.body.shareid;
        if (shareid) {
            ctx.req.user = ctx.req.user || {};
            ctx.req.user.shareid = shareid;
            return true;
        }
    }
    if (ctx.isAuthenticated() || action.publicVisit) return true;
    return false;
}

/**
 * 不需要处理的响应,若action返回此值,表示响应已经自定义处理,无需做其他处理
 */
const NoParseResult = {};

/**
 * 处理API响应
 * @param {*} method 
 * @param {Object|Function} result 返回值，若返回值为一个函数则传入ctx并执行该函数，不再使用默认的返回响应处理
 * @param {*} ctx 
 */
function parseApiResult (method, result, ctx) {
    if (result !== NoParseResult) {
        ApiResultparser[method](result, ctx);
    }
}

// 特殊参数绑定
// 请求上下文对象绑定到$ctx参数
// form对象绑定到$form
// 当前用户绑定到$user
// 其他参数常规绑定
const specialParameter = {
    $ctx: ctx => ctx,
    $form: ctx => ctx.request.body,
    $user: ctx => ctx.req.user,
    $userId: ctx => ctx.req.user.id,
    $files: ctx => ctx.request.files,
    $query:ctx=>ctx.request.query
}
function apiParameterBind (ctx, args) {
    return args.map(a => {
        if (specialParameter[a]) {
            return specialParameter[a](ctx);
        }
        return ctx.params[a] || ctx.request.body[a];
    });
}

// SPA应用浏览器回退支持配置
// 此配置将非静态资源的url的get请求统一定向到默认路由'/'从而返回页面
// 因此此路由配置需要在动态服务器接口路由之后,静态资源路由之前执行
function configHistory (app) {
    const historyApiFallback = require('koa2-connect-history-api-fallback');
    app.use(historyApiFallback());
}

module.exports.config = function (app) {
    configController(app);
    // configMobile(app);
    // configHistory(app);
    configStatic(app);
}

module.exports.NoParseResult = NoParseResult;

