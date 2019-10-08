const { RoleNames } = require('../comm/user');
const { DataSet } = require('../comm/db');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const layers = [
    'cun',
    // 'jumindian',
    'poi',
    'shengdao',
    'shidi',
    'xiandao',
    'xiangzhen',
    'quhua',
    // 'shengjie',
    'shuixi',
    'xiangdao',
    'guodao'
];



class TileTask {
    constructor(uid) {
        this.uid = uid;
        this.runing = false;
        this.createTime = new Date();
    }
    /**
     * 从数据库更新geojson文件
     */
    async updateGeoJson() {
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const dataset = new DataSet(layer);
            const data = await dataset.query();
            const json = {
                "type": "FeatureCollection",
                "name": layer,
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                features: data.map(d => {
                    const geometry = d.geom;
                    const properties = {};
                    for (let p in d) {
                        if (p !== 'geom') properties[p] = d[p];
                    }
                    return {
                        type: "Feature",
                        geometry,
                        properties
                    }
                })
            };

            const jsonStr = JSON.stringify(json);
            const jsonFile = path.join(__dirname, `../static/mapdata/${layer}.geojson`);
            fs.writeFileSync(jsonFile, jsonStr, { flag: 'w+' });
        }
    }

    async start() {
        this.runing = true;
        await this.updateGeoJson();
        return new Promise(r => {
            exec('node --max-old-space-size=10240 geojson2mvt/start.js', {
                cwd: path.join(__dirname, `../`)
            }, (error, stdout, stderr) => {
                if (error) {
                    console.error('error: ' + error);
                }
                console.log('stdout: ' + stdout);
                this.runing = false;
                r();
            });
        })
    }

    stop() {

    }
}

/**
 * 任务队列
 */
const tileTaskList = [];

let lastAutoTaskTime = 0;

function run() {
    if (tileTaskList.length) {
        if (!tileTaskList[0].runing) {
            tileTaskList[0].start();
        }
    }
    else {
        const now = new Date();
        const d = now.getDate();
        // 每个月1号15号凌晨2点自动添加一个切片任务
        if (d == 1 || d == 15) {
            if (now.getHours() == 2 && (now.getTime() - lastAutoTaskTime) > 5 * 3600 * 1000) {
                lastAutoTaskTime = now.getTime();
                tileTaskList.push(new TileTask());
            }
        }
    }
    setTimeout(run, 20000);
}

run();

module.exports = {
    get: async ctx => {
        if (ctx.isAuthenticated()) {
            let user = ctx.req.user;
            if (user.roles == RoleNames.Administrator || user.roles == RoleNames.DataManager) {
                const task = new TileTask(user.id);
                const oldTaskIndex = tileTaskList.findIndex(t => t.uid == user.uid);
                if (oldTaskIndex != -1) {
                    tileTaskList[oldTaskIndex].stop();
                    tileTaskList.splice(oldTaskIndex, 1);
                }
                tileTaskList.push(task);
                ctx.response.ok(`切片任务已成功提交，当前任务队列长度${tileTaskList.length}`);
            }
            else {
                ctx.response.notFound();
            }
        }
        else {
            ctx.response.notFound();
        }
    }
};