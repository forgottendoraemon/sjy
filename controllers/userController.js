const passport = require('koa-passport');
const usercomm = require('../comm/user');
const { DataSet } = require('../comm/db')
const { enableRegisterEmail } = require('../web.config').user

function currentUserIsAdmin(ctx) {
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

/**
 * 注册用户名与手机验证码的关系
 */
const phonenumberCodeMap = {};
/**
 * 注册用户名与手机验证码的存取接口
 */
const phonenumberCodeStore = {
    add: async (username, phonenumber) => phonenumberCodeMap[username + phonenumber] = Math.floor(Math.random() * 1000000).toString(),
    get: async (username, phonenumber) => phonenumberCodeMap[username + phonenumber]
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
     * 判断电话是否被占用
     * {phonenumber:string}
     */
    phonenumberexist: async ctx => {
        const phonenumber = ctx.query.phonenumber;
        if (phonenumber) {
            ctx.response.ok(await usercomm.exitPhonenumber(phonenumber));
        }
        else {
            ctx.response.ok(false);
        }
    },

    /**
     * 发送注册短信验证码
     * {phonenumber,username}
     */
    postphonenumbercode: async ctx => {
        const phonenumber = ctx.request.body.phonenumber;
        const username = ctx.request.body.username;
        if (phonenumber) {
            if (await usercomm.exitPhonenumber(phonenumber)) throw '该手机号已被占用';
            if (await usercomm.existUserName(username)) throw '该用户名已被占用';

            const sms = require('../comm/sms');
            const code = await phonenumberCodeStore.add(username, phonenumber);
            await sms.send([phonenumber], `【信息平台】您的注册验证码为${code}`);

            ctx.response.ok();
        }
        else {
            throw '手机号格式不正确';
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
     * {username,password,phonenumber,phonenumbercode}
     */
    postregister: async (ctx) => {
        //基础表单验证
        const cr = usercomm.verifyCreateUserReq(ctx, usercomm.RoleNames.Visitor);
        //用户名占用验证
        let existuser = await usercomm.existUserName(cr.username);
        if (existuser) {
            throw "该用户已存在";
        }
        else {
            //手机验证
            const code = await phonenumberCodeStore.get(cr.username, cr.phonenumber);
            if (cr.phonenumbercode === code) {
                //创建用户
                let user = await usercomm.createUser({
                    name: cr.username,
                    password: cr.password,
                    phonenumber: cr.phonenumber,
                    roles: usercomm.RoleNames.Visitor
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
                throw '手机验证码错误';
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
                let user = await usercomm.createUser({ name: cr.username, password: cr.password, roles: roles, phonenumber: cr.phonenumber });
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
            if (ctx.req.user.id == uid) {
                throw '不能删除自身';
            }
            if (await usercomm.deleteUser(uid)) {
                ctx.response.ok();
            }
        }
        else {
            ctx.response.unauthorized();
        }
    }
}