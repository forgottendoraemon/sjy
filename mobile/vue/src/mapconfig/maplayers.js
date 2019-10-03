import style from './style'

/**
 * 可互动的图层配置
 * {
 *  name:图层的中文名
 *  enableClick:是否响应鼠标点击事件
 *  enableTable:是否具有表格视图
 * }
 */
const layerConfig = {
    "shuixi": {
        name: "水系",
        enableClick: true,
        enableTable: true,
        fields: [
            { name: 'name', display: '名称', type: 'string' },
            {
                // 将照片放置到服务器的static/shuixi目录按`${id}-${number}.jpg`的规则设置文件名
                // 缩略图（256宽度）放置到服务器的static/shuixi目录按`${id}-${number}.jpg.thumb.jpg`的规则设置文件名
                photo: p => {
                    
                    const ps = [];
                    for (let i = 0; i < p.photoCount; i++) {
                        ps.push(`/photo/shuixi/${p.id}-${i + 1}.jpg`);
                    }
                    return ps;
                }
            }
        ]
    },
    "shidi": {
        name: "湿地",
        enableClick: true,
        enableTable: true,
        fields: [
            { name: 'name', display: '名称', type: 'string' },
            {
                photo: p => {
                    // 测试
                    return [
                        `http://localhost:3000/photo/shidi/2-1.jpg`
                    ]
                    // const ps = [];
                    // for (let i = 0; i < p.photoCount; i++) {
                    //     ps.push(`photo/shidi/${p.id}-${i + 1}.jpg`);
                    // }
                    // return ps;
                }
            }
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
    const source = layer['source-layer'];
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
 * Array<{name,ids,source,visible,enableClick,enableTable}>
 */
export default layers;