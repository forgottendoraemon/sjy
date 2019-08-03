const { DataSet } = require('../../comm/db');
const historyDataSet = new DataSet('locationhistorys');

module.exports = {
    /**
     * 获取指定用户的历史轨迹
     * uid:用户ID
     * starttime,endtime
     */
    get: async (uid, $query) => {
        const starttime = $query.starttime;
        const endtime = $query.endtime;
        let where = 'userid=$1';
        const ps = [uid];
        let i = 1;
        if (starttime) {
            where += ` and time>=$${++i}`;
            ps.push(starttime);
        }
        if (endtime) {
            where += ` and time<=$${++i}`;
            ps.push(endtime);
        }
        return await historyDataSet.query(where,ps);
    }
}
