const passport = require('koa-passport');
const session = require('koa-session');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('koa-connect-flash');
const usercomm = require('./comm/user');
const uuid = require('node-uuid');
const { differentEnable } = require('./web.config').user;

const userClientMap = {};//使用内存保存客户端和用户的对应关系
const userClientStore = {
    add: async (clientid, userid) => userClientMap[clientid] = userid,
    remove: async userid => {
        for (let clientid in userClientMap) {
            if (userClientMap[clientid] === userid) {
                delete userClientMap[clientid];
            }
        }
    },
    get: async (clientid) => userClientMap[clientid]
};

/**
 * 将用户绑定一个新的客户端标识
 * @param {*} user 
 */
async function bindUserToClient (user) {
    const clientid = uuid.v1();
    await userClientStore.add(clientid, user.id);
    if (!differentEnable) {
        await userClientStore.remove(user.id);
    }
    return clientid;
}
/**
 * 获取指定客户端标识对应的用户id
 * @param {*} clientid 
 */
async function getUserIdByClientId (clientid) {
    return userClientStore.get(clientid);
}

function config (app) {
    //登录时序列化用户标识到session
    passport.serializeUser(async function (user, done) {
        // const clientid = await bindUserToClient(user);
        const clientid = user.id;
        done(null, clientid);
    });
    //从请求的session中反序列化用户
    passport.deserializeUser(async function (clientid, done) {
        // const userid = await getUserIdByClientId(clientid);
        const userid = clientid;
        if (userid) {
            let user = await usercomm.getUserById(userid);
            if (user) {
                done(null, user);
            }
            else {
                done(null, false);
            }
        }
        else {
            done(null, false);
        }
    });

    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, done) {
        usercomm.verifyUser(username, password).then(function (user) {
            return done(null, user);
        }, function (err) {
            return done(null, false, { message: err });
        });
    }));

    app.keys = ['htbsnodekey'];
    app.use(session({ cookie: { secure: false, maxAge: 86400000 } }, app));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
}

module.exports.config = config;