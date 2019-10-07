import axios from './axios'

const layerid = 'camera';
const layerInfo = {
    name: "摄像机",
    ids: [layerid],
    source: layerid,
    visible: true
}

export default function (map, userinfo, maplayers) {
    // 在图层列表添加摄像机图层
    const haslayer = maplayers.findIndex(l => l.id == layerid) != -1;
    // 如果用户是管理员身份，则额外添加一个摄像机层
    if (userinfo && userinfo.roles === "admin" && !haslayer) {
        maplayers.unshift(layerInfo);
        map.loadImage('/camera.png', function (error, image) {
            map.addImage('camera', image);
            axios.get(`/api/mapdata/camera`).then(({ data }) => {
                const source = {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: data.map(d => ({
                            "type": "Feature",
                            "properties": {
                                name: d.name,
                                ip: d.ip,
                                info: d.info
                            },
                            "geometry": d.geom
                        }))
                    }
                };
                // 在地图上添加摄像机图层
                map.addLayer({
                    id: layerid,
                    source,
                    "type": "symbol",
                    layout: {
                        "text-field": ["to-string", ["get", "name"]],
                        "text-size": 9,
                        "icon-image": "camera",
                        "icon-size": 0.7,
                        "text-anchor": "top",
                        "text-offset": [0, 1]
                    }
                });
            });
        });

        // 给可以点击的图层，添加鼠标移入和移出的效果
        map.on("mouseenter", layerid, evt => {
            map.getCanvasContainer().style.cursor = "pointer";
        });
        map.on("mouseleave", layerid, evt => {
            map.getCanvasContainer().style.cursor = "";
        });
        // 点击摄像头，打开摄像头预览页面
        map.on("click", layerid, evt => {
            const [feature] = evt.features;
            const url = `http://${feature.properties.ip}/`;
            open(url);
        });

    }
    else {
        if (haslayer) maplayers.splice(maplayers.findIndex(l => l.id == layerid), 1);
        map.removeLayer(layerid);
    }
}