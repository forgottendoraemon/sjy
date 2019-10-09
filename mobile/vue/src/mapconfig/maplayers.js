import style from './style'
/**
 * 可互动的图层配置
 * {
 *  name:图层的中文名
 *  enableTable:是否具有表格视图
 * }
 */
const layerConfig = {
    "shuixi": {
        name: "水系",
        enableTable: true,
        fields: [
            { name: 'name', display: '名称', type: 'string' },
        ]
    },
    "shidi": {
        name: "湿地",
        enableTable: true,
        fields: [
            { name: 'name', display: '名称', type: 'string' }
        ]
    },

    "xiangdao": { name: "乡道", },
    "xiandao": { name: "县道" },
    "shengdao": { name: "省道" },
    "guodao": { name: "国道" },

    "poi": { name: "兴趣点" },
    "cun": { name: "村" },
    "xiangzhen": { name: "乡镇" }
}

const dic = {};
style.layers.forEach(layer => {
    const source = layer["source-layer"];
    const config = layerConfig[source];
    if (config) {
        const id = layer.id;
        config.ids = config.ids || [];
        config.ids.push(id);
        config.source = source;
        config.visible = true;
        dic[source] = config;
    }
});

let layers = [];
for (let p in dic) {
    layers.push(dic[p]);
}

layers = layers.reverse();

/**
 * Array<{name,ids,source,visible,enableTable}>
 */
export default layers;