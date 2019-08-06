import style from './style'

/**
 * 图层数据源与其中文名的映射关系
 */
const cnNameMap = {
    "shengjie": "行政区划",
    "quhua": "园区边界",
    "shuixi": "水系",
    "shidi": "湿地",
    "xiangdao": "乡道",
    "xiandao": "县道",
    "shengdao": "省道",
    "guodao": "国道",
    "poi": "兴趣点",
    "cun": "村",
    "xiangzhen": "乡镇"
}

const dic = {};
style.layers.forEach(layer => {
    const source = layer['source-layer'];
    if (source) {
        const id = layer.id;
        if (!dic[source]){
            dic[source]={ids:[]}
        }
        dic[source].ids.push(id);
        dic[source].name = cnNameMap[source];
        dic[source].source = source;
        dic[source].visible = true;
    }
});

let layers = [];
for (let p in dic) {
    layers.push(dic[p]);
}

layers = layers.reverse();

/**
 * Array<{name,ids,source}>
 */
export default layers;