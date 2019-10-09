/**
 * 用户管理通用业务
 */

//id, name, password, roles, lastlogintime, createtime, email, parentid

const { DataSet, execSQL } = require('./db');
const { defaultAdmin } = require('../web.config').user
const userSet = new DataSet('users');

/* 用户名密码表单验证函数 */
function verifyUserName(username) {
    if (username === "") {
        throw "用户名不能为空";
    }
    if (username.length < 5) {
        throw "用户名不能少于5位";
    }
    if (username.length > 24) {
        throw "用户名不能超过24位";
    }
}

function verifyPassowrd(password) {
    if (password === "") {
        throw "密码不能为空";
    }
    if (password.length < 6) {
        throw "密码不能少于6位";
    }
    if (password.length > 24) {
        throw "密码不能超过24位";
    }
}

function verifyEmail(email) {
    if (!email || !new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$").test(email)) {
        throw "邮箱格式不正确";
    };
}

function verifyPhonenumber(phonenumber) {
    if (!phonenumber || !((/^1([38]\d|5[0-35-9]|7[3678])\d{8}$/).test(phonenumber))) {
        throw "手机号格式不正确";
    };
}

/**
 * 用户添加请求基础验证
 * @param {*} ctx 
 * @param {*} roles 
 */
function verifyCreateUserReq(ctx, roles) {
    let postData = ctx.request.body;
    const username = postData.username.trim();
    const password = postData.password;
    const phonenumber = postData.phonenumber;
    const phonenumbercode = postData.phonenumbercode;

    verifyUserName(username);
    verifyPassowrd(password);

    // 访客必须提供手机号
    if (roles === RoleNames.Visitor) {
        verifyPhonenumber(phonenumber);
    }

    return { username, password, phonenumber, phonenumbercode };
}

async function initBasemapLayer(data) {
    return await layerSet.add(data)
}


async function getUserByName(username) {
    let result = await userSet.query('name = $1', [username]);
    return result[0];
}

async function getUserById(id) {
    let result = await userSet.query('id = $1', [id]);
    return result[0];
}

async function getUserByPhoneNumber(phonenumber) {
    let result = await userSet.query('phonenumber = $1', [phonenumber]);
    return result[0];
}

async function existUserName(username) {
    return await userSet.count('name=$1', [username]) === 1;
}

async function exitEmail(email) {
    return await userSet.count('email=$1', [email]) === 1;
}

async function exitPhonenumber(phonenumber) {
    return await userSet.count('phonenumber=$1', [phonenumber]) === 1;
}

/**
 * 读取当前系统中用户的列表
 */
async function getRegisterUserInfos() {
    const users = await userSet.query();
    return users;
}

/**
 * 获取指定用户的子用户列表
 * @param {} uid 
 */
async function getSubUsers(uid) {
    const users = await userSet.query("parentid=$1", [uid]);
    return users.map(toClientUser);
}

function isAdministrator(user) {
    return user.roles === RoleNames.Administrator;
}

/**
 * 获取用户列表
 */
async function getUserList() {
    return await userSet.query();
}

/**
 * 获取一组用户ID对应的用户名
 * @param {Array} ids 用户ID
 */
async function mapUserName(ids) {
    if (ids.length == 0) return {};
    const idsnotd = [...new Set(ids)];
    const db = require('./db');
    var result = await db.execSQL(
        `SELECT id,name FROM users where id in (${idsnotd.map(id => `'${id}'`).join(',')})`
    );
    let map = {};
    result.rows.forEach(r => map[r.id] = r.name);
    return map;
}

/* 用户数据修改 */
/**
 * 修改密码
 * @param {*} user 用户
 * @param {*} password 原密码
 * @param {*} newpassword 新密码
 */
async function changePassword(user, password, newpassword) {
    if (validPassword(user, password)) {
        verifyPassowrd(newpassword);
        user.password = passwordHash(user, newpassword);
        await userSet.update(user);
        return true;
    }
    else {
        throw "原密码错误";
    }
}

/**
 * 重置密码
 * @param {*} user 
 * @param {*} newpassword 
 */
async function restPassword(user, newpassword) {
    verifyPassowrd(newpassword);
    user.password = passwordHash(user, newpassword);
    await userSet.update(user);
    return true;
}

/**
 * 刷新用户的最后登录时间
 * @param {*} user 用户
 */
async function updateUserLoginTimeNow(user) {
    user.lastlogintime = new Date();
    await userSet.update(user);
}

/* 用户验证和添加业务 */
/**
 * 验证用户名(手机号)和密码
 * @param {*} username 
 * @param {*} password 
 */
async function verifyUser(username, password) {
    let user = await getUserByName(username);
    if (!user) {
        // 如果按用户名无法查找到用户，尝试使用手机号
        user = await getUserByPhoneNumber(username);
    }
    if (user) {
        if (validPassword(user, password)) {
            return user;
        }
        else {
            throw "用户名/手机号或密码错误";
        }
    }
    else {
        throw "用户名/手机号或密码错误";
    }
}

/**
 * 创建一个新用户
 * @param {*} user 
 */
async function createUser(user) {
    const uuid = require('node-uuid');
    let uid = uuid.v1();
    user.id = uid;
    let ph = passwordHash(user, user.password);
    user.password = ph;
    user.createtime = new Date();
    await userSet.add(user, uid);
    return user;
}

/**
 * 删除指定id的用户
 * @param {*} id 
 */
async function deleteUser(id) {
    return await userSet.removeById(id) === 1;
}

/**
 * 将用户信息传输到客户端
 * 用户名、角色
 * @param {*} user 
 */
function toClientUser(user) {
    return {
        name: user.name,
        isAdministrator: isAdministrator(user),
        roles: user.roles,
        email: user.email,
        id: user.id
    };
}

/* 密码生成和验证策略 */
/**
 * 为指定用户生成密码哈希
 * @param {*} user 
 * @param {*} password 
 */
function passwordHash(user, password) {
    let s = user.id;
    let np = "";
    for (let i = 0; i < password.length; i++) {
        np += password[i];
        if (isPrimeNumberIn100(i)) {
            for (let j = i; j < i + 3; j++) {
                np += String.fromCharCode(s.charCodeAt(j) + j);
            }
        }
    }
    let sha512 = require('crypto').createHash("sha512");
    return sha512.update(np).digest('hex');
}

function isPrimeNumberIn100(i) {
    return (i == 2 || i == 3 || i == 5 || i == 7) || (i % 2 != 0 && i % 3 != 0 && i % 5 != 0 && i % 7 != 0);
}

function validPassword(user, password) {
    let ph = passwordHash(user, password);
    return user.password === ph;
}

/* 用户初始化 */
function initUser() {
    userSet.count(`name='${defaultAdmin.username}'`).then(function (count) {
        if (count == 0) {
            createUser({ name: defaultAdmin.username, password: defaultAdmin.password, roles: RoleNames.Administrator }).then(() => console.log("user inited"));
        }
    }, function (err) {
        console.log(`init user data error ${err}`);
    });
}

/**
 * 重置管理员用户的密码和角色
 */
function resetAdminUser() {
    console.log("resetAdminUser");
    userSet.single(`name='${defaultAdmin.username}'`).then(au => {
        au.password = passwordHash(au, defaultAdmin.passowrd);
        au.roles = RoleNames.Administrator;
        userSet.update(au).then((r) => {
            console.log("resetAdminUser ok");
        });
    });
}

// resetAdminUser();

/**
 * 用户角色类型
 */
const RoleNames = {
    /**
     * 管理员
     */
    Administrator: "admin",
    /**
     * 工作人员
     */
    Worker: "worker",
    /**
     * 访客
     */
    Visitor: "visitor",
    /**
     * 数据管理员
     */
    DataManager: 'datamanager'
};

initUser();
// resetAdminUser();

module.exports = {
    toClientUser,
    existUserName,
    verifyCreateUserReq,
    createUser,
    getUserById,
    verifyUser,
    getRegisterUserInfos,
    RoleNames,
    isAdministrator,
    updateUserLoginTimeNow,
    changePassword,
    deleteUser,
    mapUserName,
    getUserList,
    initBasemapLayer,
    exitEmail,
    passwordHash,
    verifyPassowrd,
    verifyEmail,
    getSubUsers,
    exitPhonenumber,
    getUserByPhoneNumber,
    restPassword
};