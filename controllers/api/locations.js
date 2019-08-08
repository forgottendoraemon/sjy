const { DataSet, execSQL } = require('../../comm/db');
const { RoleNames, isAdministrator } = require('../../comm/user');

const dataSet = new DataSet('locations');
const historyDataSet = new DataSet('locationhistorys');

/**
 * 当前处在园区的人数
 */
var CurentQHPeopleCount = -1;

/**
 * 用户位置的有效时间（超过此时间则视为无效的定位数据，不计入人员数量）
 */
const KeepTimeHour = 3;

/**
 * 更新园区人数
 */
async function updatePeopleCount() {
    const { rows } = await execSQL(
        `SELECT count(locations.id) FROM locations 
            join quhua on ST_Intersects(locations.geom,quhua.geom)
            WHERE locations.time>$1`, [new Date(new Date().getTime() - KeepTimeHour * 3600 * 1000)]);
    CurentQHPeopleCount = Number(rows[0].count);

    console.log(`updatePeopleCount CurentQHPeopleCount=${CurentQHPeopleCount}`)
}

/**
 * 获取当前园区人数
 */
async function getPeopleCount() {
    if (CurentQHPeopleCount == -1) {
        await updatePeopleCount();
    }
    return CurentQHPeopleCount;
}

/**
 * 预警级别
 */
const WarningLvevl = [
    {
        count: 1,
        level: 1,
        name: '蓝色预警'
    },
    {
        count: 2,
        level: 2,
        name: '黄色预警'
    },
    {
        count: 3,
        level: 3,
        name: '红色预警'
    },
];

const controller = {
    /**
     * 获取所有用户的最新位置
     */
    get: async () => {
        return await dataSet.query();
    },
    /**
     * 获取所有访客的最新位置
     */
    getVisitor: async () => {
        const result = await execSQL(
            `SELECT locations.id, ST_AsGeoJSON(geom),userid, "time"
                FROM public.locations
                join users on userid = users.id
                where users.roles = $1`,
            [RoleNames.Visitor]
        );
        return result.rows;
    },
    /**
     * 获取所有工作人员的最新位置
     */
    getWorker: async () => {
        const result = await execSQL(
            `SELECT locations.id, ST_AsGeoJSON(geom),userid, "time"
                FROM public.locations
                join users on userid = users.id
                where users.roles = $1`,
            [RoleNames.Worker]
        );
        return result.rows;
    },
    /**
     * 提交最新位置
     * {
     * time:new Date(),
     * geom:{"type":"Point","coordinates":[101.1,36.1]},
     * uid:uuid
     * }
     */
    post: async ($form, $user) => {
        const uid = $user ? $user.id : $form.uid;
        const location = {
            userid: uid,
            time: new Date($form.time),
            geom: $form.geom
        };
        // 将位置添加到历史位置数据库
        await historyDataSet.add(location);
        const locationlast = await dataSet.firstOrDefault('userid=$1', [uid]);
        // 更新或添加实时位置
        if (locationlast) {
            if (locationlast.time.getTime() < location.time.getTime()) {
                await dataSet.updateByWhere('userid=$1', [uid], {
                    time: $form.time,
                    geom: $form.geom
                });
            }
        }
        else {
            await dataSet.add(location);
        }
        // 更新园区人数
        updatePeopleCount();
    },

    /**
     * 获取预警级别和园区人数
     */
    getWarningLevel: async ($user) => {
        if (isAdministrator($user)) {
            const peopleCount = await getPeopleCount();
            let level = null;
            for (let i = 0; i < WarningLvevl.length; i++) {
                const element = WarningLvevl[i];
                if (peopleCount < element.count) break;
                level = element;
            }
            return { level, peopleCount };
        }
        else {
            throw 'unauthorized';
        }
    }
}

controller.post.publicVisit = true;
controller.getVisitor.routePath = 'visitor';
controller.getWorker.routePath = 'worker';
controller.getWarningLevel.routePath = 'warninglevel';

module.exports = controller;