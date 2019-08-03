const { DataSet, execSQL } = require('../../comm/db');
const { RoleNames } = require('../../comm/user');

const dataSet = new DataSet('locations');
const historyDataSet = new DataSet('locationhistorys');

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
     * geom:{"type":"Point","coordinates":[101.1,36.1]}
     * }
     */
    post: async ($form, $user) => {
        const location = {
            userid: $user.id,
            time: new Date($form.time),
            geom: $form.geom
        };
        await historyDataSet.add(location);
        const locationlast = await dataSet.firstOrDefault('userid=$1', [$user.id]);
        if(locationlast){
            if (locationlast.time.getTime() < location.time.getTime()) {
                dataSet.updateByWhere('userid=$1', [$user.id], {
                    time: $form.time,
                    geom: $form.geom
                });
            }
        }
        else{
            await dataSet.add(location);
        }
    }
}

controller.getVisitor.routePath = 'visitor';
controller.getWorker.routePath = 'worker';

module.exports = controller;