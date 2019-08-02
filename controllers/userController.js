const passport = require('koa-passport');
const usercomm = require('../comm/user');
const { DataSet } = require('../comm/db')
const { enableRegisterEmail } = require('../web.config').user

function currentUserIsAdmin (ctx) {
    return ctx.isAuthenticated() && usercomm.isAdministrator(ctx.req.user);
}

/**
 * 注册用户名与邮箱验证码的关系
 */
const emailCodeMap = {};
/**
 * 注册用户名与邮箱验证码的存取接口
 */
const emailCodeStore = {
    add: async (username, email) => emailCodeMap[username + email] = Math.floor(Math.random() * 10000).toString(),
    get: async (username, email) => enableRegisterEmail ? emailCodeMap[username + email] : '1234'
};

module.exports = {
    /**
     * 登录
     * {username,password}
     */
    postlogin: async (ctx, next) => {
        //验证并获得用户对象
        const user = await new Promise((resolve, reject) => {
            const authuse = passport.authenticate('local', (err, user, info) => {
                if (err) { reject(err) }
                else if (user) { resolve(user) }
                else { reject(info.message) }
            });
            authuse(ctx, next);
        });
        //登录该用户
        await new Promise((resolve, reject) => {
            ctx.logIn(user, (err) => {
                if (err) { reject(err) }
                else { resolve(); }
            });
        });
        //返回用户信息、刷新用户登录时间
        ctx.response.ok(usercomm.toClientUser(user));
        usercomm.updateUserLoginTimeNow(user);
    },
    /**
     * 注销
     */
    logout: ctx => {
        ctx.logout();
        ctx.response.ok();
    },
    /**
     * 获取当前用户信息
     */
    user: async ctx => {
        if (ctx.isAuthenticated()) {
            let user = ctx.req.user;
            const clientUser = usercomm.toClientUser(user);
            clientUser.vaservice = await getUserVAServiceStatus(user.id);
            ctx.response.ok(clientUser);
        }
        else {
            ctx.response.notFound();
        }
    },
    /**
     * 判断邮箱是否被占用
     * {email:string}
     */
    emailexist: async ctx => {
        const email = ctx.query.email;
        if (email) {
            ctx.response.ok(await usercomm.exitEmail(email));
        }
        else {
            ctx.response.ok(false);
        }
    },
    /**
     * 发送注册邮箱验证码
     * {email,username}
     */
    postemailcode: async ctx => {

        const email = ctx.request.body.email;
        const username = ctx.request.body.username;
        if (email && new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$").test(email)) {
            if (await usercomm.exitEmail(email)) throw '该邮箱已被占用';
            if (await usercomm.existUserName(username)) throw '该用户名已被占用';

            if (enableRegisterEmail) {
                const code = await emailCodeStore.add(username, email);
                const emailcomm = require('../comm/email');
                await emailcomm.sendMail(email, '三江源GIS系统', `<p>感谢您使用三江源GIS系统！验证码：${code}<br>如果您没有要求绑定邮箱，请忽略此邮件。</p>`);
            }

            ctx.response.ok();
        }
        else {
            throw '邮箱格式不正确';
        }
    },
    /**
     * 用户注册
     * {username,password,email,emailcode}
     */
    postregister: async (ctx) => {
        //基础表单验证
        const cr = usercomm.verifyCreateUserReq(ctx, usercomm.RoleNames.SubUser);
        //用户名占用验证
        let existuser = await usercomm.existUserName(cr.username);
        if (existuser) {
            throw "该用户已存在";
        }
        else {
            //邮箱验证
            const emailcode = await emailCodeStore.get(cr.username, cr.email);
            if (cr.emailcode === emailcode) {
                //创建用户
                let user = await usercomm.createUser({
                    name: cr.username,
                    password: cr.password,
                    email: cr.email,
                    roles: usercomm.RoleNames.SubUser
                });
                //登录该用户
                await new Promise((resolve, reject) => {
                    ctx.logIn(user, (err) => {
                        if (err) { reject(err) }
                        else { resolve(); }
                    });
                });
                ctx.response.ok(usercomm.toClientUser(user));
                //记录用户登录时间
                usercomm.updateUserLoginTimeNow(user);
            }
            else {
                throw '邮箱验证码错误';
            }
        }
    },
    /**
     * 判断用户名是否被占用
     * {username:string}
     */
    userexist: async (ctx) => {
        let username = ctx.query.username;
        if (username) {
            ctx.response.ok(await usercomm.existUserName(username));
        }
        else {
            ctx.response.ok(false);
        }
    },

    /**
     * 修改当前用户的密码
     * {password,newpassword}
     */
    postchangepassword: async (ctx) => {
        if (ctx.isAuthenticated()) {
            let user = ctx.req.user;
            let password = ctx.request.body.password;
            let newpassword = ctx.request.body.newpassword;
            if (await usercomm.changePassword(user, password, newpassword)) {
                ctx.response.ok();
            }
            else {
                ctx.response.badRequest();
            }
        }
        else {
            ctx.response.unauthorized();
        }
    },

    /* 用户管理接口(仅系统管理员访问) */
    //读取当前系统中用户的列表
    userlist: async (ctx) => {
        if (currentUserIsAdmin(ctx)) {
            let us = await usercomm.getRegisterUserInfos();
            ctx.response.ok(us);
        }
        else {
            ctx.response.unauthorized();
        }
    },

    //添加用户 POST {username,password,roles}
    postadduser: async (ctx) => {
        if (currentUserIsAdmin(ctx)) {
            let roles = ctx.request.body.roles;
            const cr = usercomm.verifyCreateUserReq(ctx, roles);
            let existuser = await usercomm.existUserName(cr.username);
            if (existuser) {
                throw "该用户已存在";
            }
            else {
                let user = await usercomm.createUser({ name: cr.username, password: cr.password, roles: roles, email: cr.email });
                ctx.response.ok(usercomm.toClientUser(user));
            }
        }
        else {
            ctx.response.unauthorized();
        }
    },

    //删除用户 DELETE id={userid}
    deleteuser: async (ctx) => {
        if (currentUserIsAdmin(ctx)) {
            let uid = ctx.request.query.id;
            //TODO:删除组织账号后尚未删除其子账号
            if (await usercomm.deleteUser(uid)) {
                ctx.response.ok();
            }
        }
        else {
            ctx.response.unauthorized();
        }
    }
}