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
        // return await dataSet.query();
        const result = await execSQL(
            `SELECT locations.id, ST_AsGeoJSON(locations.geom) as geom,userid, "time",users.name
            FROM public.locations
            left join users on userid = users.id`
        );
        return result.rows.map(r => {
            r.geom = JSON.parse(r.geom);
            return r;
        });
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
     * 提交一组位置记录
     * {
     *  uid:uuid,
     *  locations:Array<{
     *      time:number,
     *      coordinates:[lng,lat]
     *  }>
     * }
     */
    post: async ($form, $user) => {
        const uid = $user ? $user.id : $form.uid;
        const locations = $form.locations.map(p => (
            {
                userid: uid,
                time: new Date(p.time),
                geom: {
                    "type": "Point",
                    "coordinates": p.coordinates
                }
            }
        ));
        let lastLocationTime = 0, lastLocation;
        for (let i = 0; i < locations.length; i++) {
            const location = locations[i];
            // 将位置添加到历史位置数据库
            await historyDataSet.add(location);
            if (lastLocationTime < location.time.getTime()) {
                lastLocation = location;
                lastLocationTime = location.time.getTime();
            }
        }

        const locationlast = await dataSet.firstOrDefault('userid=$1', [uid]);
        // 更新或添加实时位置
        if (locationlast) {
            if (locationlast.time.getTime() < lastLocationTime) {
                await dataSet.updateByWhere('userid=$1', [uid], {
                    time: lastLocation.time,
                    geom: lastLocation.geom
                });
            }
        }
        else {
            await dataSet.add(lastLocation);
        }

        // 更新园区人数
        updatePeopleCount();
    },

    /**
     * 获取预警级别和园区人数
     */
    getWarningLevel: async ($user) => {
        if ($user.roles == RoleNames.Administrator || $user.roles == RoleNames.Worker) {
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