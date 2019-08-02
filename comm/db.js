const pg = require('pg');
const uuid = require('node-uuid');
const config = require('../web.config').db;

var pool = new pg.Pool(config);
/**
 * 执行SQL查询
 * @param {*} sql 
 * @param {*} ps 
 */
async function execSQL (sql, ps) {
    try {
        //console.log(`EXEC SQL "${sql}"`)
        var connect = await pool.connect();
        var res = await connect.query(sql, ps);
        return res;
    }
    catch (ex) {
        throw new Error(`Exec SQL ${sql} ${ex.message}`);
    }
    finally {
        connect.release();
    }
}

/**
 * 表结构缓存
 */
var tableFieldCache = {};

/**
 * 数据表
 */
class DataSet {

    constructor(tableName) {
        this.tableName = tableName;
        /**
         * 查询实体对象时，需要提取的字段列表
         * Array<{field,type}>
         */
        this.readFields = null;
        /**
         * 查询实体对象时，不需要提取的字段列表
         * string[]
         */
        this.readHideFields = null;
    }

    /**
     * 从数据库初始化表信息
     */
    async _init () {
        if (!this._inited) {
            if (tableFieldCache[this.tableName]) {
                this.fields = tableFieldCache[this.tableName];
            }
            else {
                let tableInfoResult = await execSQL(`SELECT a.attnum,
                                a.attname AS field,
                                t.typname AS type,
                                a.attlen AS length,
                                a.atttypmod AS lengthvar,
                                a.attnotnull AS notnull,
                                b.description AS comment
                                FROM pg_class c,
                                pg_attribute a
                                LEFT OUTER JOIN pg_description b ON a.attrelid=b.objoid AND a.attnum = b.objsubid,
                                pg_type t
                                WHERE c.relname = $1
                                and a.attnum > 0
                                and a.attrelid = c.oid
                                and a.atttypid = t.oid
                                ORDER BY a.attnum`
                    , [this.tableName]);
                this.fields = tableFieldCache[this.tableName] = tableInfoResult.rows;
                if (!this.fields || this.fields.length == 0) throw '表结构获取失败，请确认表名称';
            }

            this._inited = true;
            this.readFields = this.fields.filter(t => this.readHideFields ? (this.readHideFields.indexOf(t.field) === -1) : true);
        }
    }

    /**
     * 向表中插入一个新对象,成功后将设置实体的id属性,若显式设置了id，则使用该id
     * @param {object} entity 
     * @param {object} newid 
     */
    async add (entity, newid) {
        await this._init();

        let id = newid || uuid.v1();
        let ps = [], psv = [];
        for (let i = 0, j = this.fields.length; i < j; i++) {
            let f = this.fields[i];
            if (f.field === "id") {
                // 系统所有id均采用UUID类型
                ps.push(`$${psv.length + 1}`);
                psv.push(id);
            }
            else {
                let v = entity[f.field];
                let pc = sqlParameterConvert[f.type];
                if (pc) v = pc(v);
                let evs = entityValue2SQLMap[f.type];
                if (evs) {
                    ps.push(evs(v));
                }
                else {
                    ps.push(`$${psv.length + 1}`);
                    psv.push(v);
                }
            }
        }

        let psSql = ps.join(',');
        let cs = this.fields.map(f => f.field).join(",");

        let sql = `INSERT INTO ${this.tableName} (${cs}) VALUES (${psSql})`;

        let result = await execSQL(sql, psv);
        entity.id = id;

        return entity;
    }

    /**
     * 从表中移除指定的对象
     * @param {*} entity 
     */
    async reomve (entity) {
        return this.removeById(entity.id);
    }

    /**
     * 从表中移除指定id的对象
     * @param {*} id 
     */
    async removeById (id) {
        let sql = `DELETE FROM ${this.tableName} WHERE id = $1`;
        let result = await execSQL(sql, [id]);
        return result.rowCount;
    }

    /**
     * 从表中移除符合指定条件的对象，返回删除的记录行数
     * @param {string} whereClause 
     * @param {Array} ps 
     */
    async removeByWhere (whereClause, ps) {
        let sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
        let result = await execSQL(sql, ps);
        return result.rowCount;
    }

    /**
     * 查询表数据
     * @param {string} whereClause SQL WHERE子句
     * @param {Array} ps 查询参数
     */
    async query (whereClause, ps) {
        await this._init();

        let cs = this.readFields.map(f => {
            let fsm = field2SQLFuncMap[f.type];
            if (fsm) {
                return fsm(f.field);
            }
            return f.field;
        }).join(",");
        let sql = `SELECT ${cs} FROM ${this.tableName}`;
        if (whereClause) {
            sql += ` WHERE ${whereClause}`;
        }

        let result = await execSQL(sql, ps);
        return result.rows.map(row => mapEntity(row, this.fields));
    }

    /**
     * 查询符合条件的唯一记录，若结果个数不为1，则抛出异常
     * @param {string} whereClause  SQL WHERE子句
     * @param {Array} ps 查询参数
     */
    async single (whereClause, ps) {
        let result = await this.query(whereClause, ps);
        if (result.length !== 1) {
            throw new Error("not fond single object");
        }
        return result[0];
    }

    /**
     * 查询符合条件的唯一记录，若结果个数不为1或0，则抛出异常
     * @param {*} whereClause 
     * @param {*} ps 
     */
    async singleOrDefault (whereClause, ps) {
        let result = await this.query(whereClause, ps);
        if (result.length > 1) {
            throw new Error("not fond single object");
        }
        return result[0];
    }

    /**
     * 查询符合条件的第一个记录
     * @param {*} whereClause 
     * @param {*} ps 
     */
    async firstOrDefault (whereClause, ps) {
        let result = await this.query(whereClause, ps);
        return result[0];
    }

    /**
     * 按ID查询一条记录
     * @param {string} id 
     */
    async find (id) {
        return await this.single('id=$1', [id]);
    }

    /**
     * 查询指定条件的数据个数
     * @param {*} whereClause 
     * @param {*} ps 
     */
    async count (whereClause, ps) {
        let sql = `SELECT COUNT(id) as "count" FROM ${this.tableName}`;
        if (whereClause) {
            sql += ` WHERE ${whereClause}`;
        }
        let result = await execSQL(sql, ps);
        return Number(result.rows[0].count);
    }

    /**
     * 查询是否存在满足条件的记录
     * @param {*} whereClause 
     * @param {*} ps 
     */
    async any (whereClause, ps) {
        let sql = `SELECT COUNT(id) as "count" FROM ${this.tableName}`;
        if (whereClause) {
            sql += ` WHERE ${whereClause}`;
        }
        let result = await execSQL(sql, ps);
        return Number(result.rows[0].count) > 0;
    }

    /**
     * 更新对象的属性(对象的所有属性都更新)
     * @param {*} entity 
     */
    async update (entity) {
        await this._init();

        let ps = [], psv = [];
        for (let i = 0, j = this.fields.length; i < j; i++) {
            let f = this.fields[i];
            if (f.field === "id") continue;
            let v = entity[f.field];
            let pc = sqlParameterConvert[f.type];
            if (pc) v = pc(v);
            let evs = entityValue2SQLMap[f.type];
            if (evs) {
                ps.push(`${f.field}=${evs(v)}`);
            }
            else {
                ps.push(`${f.field}=$${psv.length + 1}`);
                psv.push(v);
            }
        }
        psv.push(entity.id);
        let psSql = ps.join(',');

        let sql = `UPDATE ${this.tableName} SET ${psSql} WHERE id = $${psv.length}`;
        await execSQL(sql, psv);
    }

    /**
     * 更新指定id对象的部分属性
     * @param {*} id 
     * @param {*} entity 
     */
    async updateById (id, entity) {
        await this._init();

        let ps = [], psv = [];
        for (let i = 0, j = this.fields.length; i < j; i++) {
            let f = this.fields[i];
            if (f.field === "id" || entity[f.field] === undefined) continue;
            let v = entity[f.field];
            let pc = sqlParameterConvert[f.type];
            if (pc) v = pc(v);
            let evs = entityValue2SQLMap[f.type];
            if (evs) {
                ps.push(`${f.field}=${evs(v)}`);
            }
            else {
                ps.push(`${f.field}=$${psv.length + 1}`);
                psv.push(v);
            }
        }
        psv.push(id);
        let psSql = ps.join(',');

        let sql = `UPDATE ${this.tableName} SET ${psSql} WHERE id = $${psv.length}`;
        await execSQL(sql, psv);
    }

    /**
     * 批量修改符合条件的对象属性
     * @param {String} whereClause 
     * @param {Array} whereps 
     * @param {object} entity 
     */
    async updateByWhere (whereClause, whereps, entity) {
        await this._init();

        let ps = [], psv = [];
        whereps && whereps.forEach(x => psv.push(x));
        for (let i = 0, j = this.fields.length; i < j; i++) {
            let f = this.fields[i];
            if (f.field === "id" || entity[f.field] === undefined) continue;
            let v = entity[f.field];
            let pc = sqlParameterConvert[f.type];
            if (pc) v = pc(v);
            let evs = entityValue2SQLMap[f.type];
            if (evs) {
                ps.push(`${f.field}=${evs(v)}`);
            }
            else {
                ps.push(`${f.field}=$${psv.length + 1}`);
                psv.push(v);
            }
        }
        let psSql = ps.join(',');

        let sql = `UPDATE ${this.tableName} SET ${psSql} WHERE ${whereClause}`;
        await execSQL(sql, psv);
    }
}

// 查询特定类型字段时使用的SQL
var field2SQLFuncMap = {
    geometry: field => {
        return `ST_AsGeoJSON(${field}) as "${field}"`;
    }
};

// 从数据库特定类型字段后映射为合适的js对象
var dbType2EntityObjMap = {
    geometry: value => {
        return JSON.parse(value)
    }
};

/**
 * 将无法参数化的值直接转为SQL表达式字符串插入到最终的SQL中
 */
var entityValue2SQLMap = {
    geometry: value => {
        if (value) {
            return `ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(value)}'),4326)`;
        }
        return null;
    }
};

/**
 * SQL查询参数的类型转换
 */
const sqlParameterConvert = {
    timestamp: value => {
        if (value) {
            if (!(value instanceof Date)) {
                return new Date(value);
            }
            return value;
        }
        return null;
    }
}

/**
 * 将从数据库读取的行，映射为js对象
 * @param {object} dataRow 数据行
 * @param {Array} fields 数据表字段信息
 */
function mapEntity (dataRow, fields) {
    fields.forEach(f => {
        let emf = dbType2EntityObjMap[f.type]
        if (emf) {
            dataRow[f.field] = emf(dataRow[f.field]);
        }
    });
    return dataRow;
}

var DataSetMap = {};

function table (tableName) {
    return DataSetMap[tableName] || (DataSetMap[tableName] = new DataSet(tableName));
}

module.exports = {
    execSQL,
    DataSet,
    table
}