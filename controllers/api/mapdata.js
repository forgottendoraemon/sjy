/**
 * 地图图层数据
 */

const { DataSet } = require('../../comm/db');

/**
 * 要搜索的数据表
 */
const mapTables = [
    "shuixi",
    "shidi",
    "xiangdao",
    "xiandao",
    "shengdao",
    "guodao",
    "poi",
    "cun",
    "xiangzhen",
    "camera"
];
/**
 * 要搜索的字段
 */
const searchFields = 'name';

const dataSets = {};
mapTables.forEach(t => {
    dataSets[t] = new DataSet(t);
})


const controller = {
    /**
     * 获取指定图层的数据
     */
    get: async (name) => {
        const dataset = dataSets[name];
        if (dataset) {
            return await dataset.query();
        }
        else {
            throw '不存在的图层';
        }
    },
    /**
     * 关键字搜索
     */
    search: async (key) => {
        const qs = [];
        for (let p in dataSets) {
            qs.push(dataSets[p].query(`${searchFields} like $1 limit 10`, [`%${key}%`]));
        }
        const results = await Promise.all(qs);
        return results.map((rows, i) => ({ layer: mapTables[i], rows })).filter(t => t.rows.length);
    }
};

controller.search.routePath = 'search/:key';
controller.search.publicVisit = true;

module.exports = controller;