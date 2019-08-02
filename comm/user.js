/**
 * 用户管理通用业务
 */

//id, name, password, roles, last_login_time, createtime, email, parentid

const { DataSet, execSQL } = require('./db');
const { defaultAdmin } = require('../web.config').user
const userSet = new DataSet('users');
const layerSet = new DataSet('layers');

/* 用户名密码表单验证函数 */
function verifyUserName (username) {
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

function verifyPassowrd (password) {
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

function verifyEmail (email) {
    if (!email || !new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$").test(email)) {
        throw "邮箱格式不正确";
    };
}

/**
 * 用户添加请求基础验证
 * @param {*} ctx 
 * @param {*} roles 
 */
function verifyCreateUserReq (ctx, roles) {
    let postData = ctx.request.body;
    const username = postData.username.trim();
    const password = postData.password;
    const email = postData.email;
    const emailcode = postData.emailcode;

    verifyUserName(username);
    verifyPassowrd(password);

    //组织管理员用户必须填写邮箱
    if (roles === RoleNames.Organizer) {
        verifyEmail(email);
    }

    return { username, password, email, emailcode };
}

async function initBasemapLayer (data) {
    return await layerSet.add(data)
}


async function getUserByName (username) {
    let result = await userSet.query('name = $1', [username]);
    return result[0];
}

async function getUserById (id) {
    let result = await userSet.query('id = $1', [id]);
    return result[0];
}

async function existUserName (username) {
    return await userSet.count('name=$1', [username]) === 1;
}

async function exitEmail (email) {
    return await userSet.count('email=$1', [email]) === 1;
}

/**
 * 读取当前系统中用户的列表
 * 及其使用情况(不包括组织子用户)
 */
async function getRegisterUserInfos () {
    const users = await userSet.query('roles<>$1', [RoleNames.SubUser]);
    for (let i = 0; i < users.length; i++) {
        const { id, roles } = users[i];

        //统计用户使用的数据总条数
        const cr = await execSQL(
            `SELECT 
                SUM((SELECT COUNT(features.id) FROM features WHERE features.layerid=layers.id)) as count 
            FROM layers 
            WHERE layers.ownerid=$1`, [id]);
        users[i].recordCount = Number(cr.rows[0].count) || 0;

        //统计组织管理员用户的子用户数量
        if (roles === RoleNames.Organizer) {
            const cr = await execSQL(`SELECT COUNT(id) FROM users WHERE parentid=$1`, [id]);
            users[i].subUserCount = Number(cr.rows[0].count);
        }
        users[i].subUserCount = users[i].subUserCount || 0;
    }
    return users;
}

/**
 * 获取指定用户的子用户列表
 * @param {} uid 
 */
async function getSubUsers (uid) {
    const users = await userSet.query("parentid=$1", [uid]);
    return users.map(toClientUser);
}

function isAdministrator (user) {
    return user.roles === RoleNames.Administrator;
}

/**
 * 获取用户列表
 */
async function getUserList () {
    return await userSet.query();
}

/**
 * 获取一组用户ID对应的用户名
 * @param {Array} ids 用户ID
 */
async function mapUserName (ids) {
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
async function changePassword (user, password, newpassword) {
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
 * 刷新用户的最后登录时间
 * @param {*} user 用户
 */
async function updateUserLoginTimeNow (user) {
    user.last_login_time = new Date();
    await userSet.update(user);
}

/* 用户验证和添加业务 */
/**
 * 验证用户名和密码
 * @param {*} username 
 * @param {*} password 
 */
async function verifyUser (username, password) {
    let user = await getUserByName(username);
    if (user) {
        if (validPassword(user, password)) {
            return user;
        }
        else {
            throw "用户名或密码错误";
        }
    }
    else {
        throw "用户名或密码错误";
    }
}

/**
 * 创建一个新用户
 * @param {*} user 
 */
async function createUser (user) {
    const uuid = require('node-uuid');
    let uid = uuid.v1();
    user.id = uid;
    let ph = passwordHash(user, user.password);
    user.password = ph;
    user.createtime = new Date();
    await userSet.add(user, uid);

    if (user.roles !== RoleNames.SubUser) {
        // 初始化底图
        await initBasemapLayer({
            ownerid: user.id,
            name: '在线地图',
            type: 'base-map',
            zindex: 1,
            visible: true,
            style: {
                currentMap: 'Google地图'
            }
        })
    }

    return user;
}

/**
 * 删除指定id的用户
 * @param {*} id 
 */
async function deleteUser (id) {
    return await userSet.removeById(id) === 1;
}

/**
 * 将用户信息传输到客户端
 * 用户名、角色
 * @param {*} user 
 */
function toClientUser (user) {
    return {
        name: user.name,
        isAdministrator: isAdministrator(user),
        roles: user.roles,
        email: user.email
    };
}

/* 密码生成和验证策略 */
/**
 * 为指定用户生成密码哈希
 * @param {*} user 
 * @param {*} password 
 */
function passwordHash (user, password) {
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

function isPrimeNumberIn100 (i) {
    return (i == 2 || i == 3 || i == 5 || i == 7) || (i % 2 != 0 && i % 3 != 0 && i % 5 != 0 && i % 7 != 0);
}

function validPassword (user, password) {
    let ph = passwordHash(user, password);
    return user.password === ph;
}

/* 用户初始化 */
function initUser () {
    userSet.count(`name='${defaultAdmin.username}'`).then(function (count) {
        if (count == 0) {
            createUser({ name: defaultAdmin.username, password: defaultAdmin.passowrd, roles: RoleNames.Administrator }).then(() => console.log("user inited"));
        }
    }, function (err) {
        console.log(`init user data error ${err}`);
    });
}

/**
 * 重置管理员用户的密码和角色
 */
function resetAdminUser () {
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
     * 组织管理员
     */
    Organizer: "organizer",
    /**
     * 组织成员
     */
    SubUser: "subuser"
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
    getSubUsers
};