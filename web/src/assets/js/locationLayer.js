import axios from './axios'

const layerid = 'location';
const locationLayerInfo = {
    name: "实时位置",
    ids: [layerid],
    source: layerid,
    visible: true
}

var currentSearchPopup;
const lineLayerid = 'location-historys'
const lineStyle = {
    type: "line",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#f00", "line-width": 3 }
};

var timer = null;
/**
 * 实时位置更新间隔(ms)
 */
const timeInterval = 5 * 1000;

function startUpdate(map) {
    function update() {
        axios.get('/api/locations').then(({ data }) => {
            // 转为geojson格式
            const geojsonData = {
                type: "FeatureCollection",
                features: data.map(e => ({
                    type: "Feature",
                    geometry: e.geom,
                    properties: { name: e.name || e.userid, time: e.time }
                }))
            };
            map.getSource(layerid).setData(geojsonData);

            timer = setTimeout(update, timeInterval);
        }).catch(() => {
            timer = setTimeout(update, timeInterval);
        });
    }
    update();
}
function stopUpdate() {
    clearTimeout(timer);
}

export default function (map, userinfo, maplayers) {
    // 在图层列表添加实时位置图层
    const haslayer = maplayers[0].source === locationLayerInfo.source;
    // 如果用户是管理员身份，则额外添加一个实时位置层
    if (userinfo && userinfo.roles === "admin") {
        if (!haslayer) maplayers.unshift(locationLayerInfo);
        // 在地图上添加实时位置图层
        map.addLayer({
            id: layerid,
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                }
            },
            type: "circle",
            paint: {
                "circle-color": "#f00",
                "circle-stroke-color": "#000",
                "circle-stroke-opacity": 1,
                "circle-blur": 0
            }
        });

        // 给可以点击的图层，添加鼠标移入和移出的效果
        map.on("mouseenter", layerid, evt => {
            map.getCanvasContainer().style.cursor = "pointer";
        });
        map.on("mouseleave", layerid, evt => {
            map.getCanvasContainer().style.cursor = "";
        });
        // 当点击可点击的图层时，打开被点击的对象的详细属性
        map.on("click", layerid, evt => {
            const [feature] = evt.features;
            // 清除轨迹
            const clearFeatrue = () => {
                if (map.getLayer(lineLayerid)) {
                    console.log(lineLayerid, map.getLayer(lineLayerid));
                    map.removeLayer(lineLayerid);
                    map.removeSource(lineLayerid);
                }
            };

            currentSearchPopup = new mapboxgl.Popup({ closeOnClick: false })
                .setLngLat(feature.geometry.coordinates)
                .setHTML(`名称:${feature.properties.name}<br/>时间:${feature.properties.time}`)
                .addTo(map)
                .once("close", clearFeatrue);

            // 移除现有线路
            clearFeatrue();
            // 获取轨迹数据
            const uid = feature.properties.userid;
            axios.get(`/api/locationhistorys/${uid}`).then(({ data }) => {
                const source = {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: [
                            {
                                "type": "Feature",
                                "properties": {},
                                "geometry": {
                                    "type": "LineString",
                                    "coordinates": data.map(d => d.geom.coordinates)
                                }
                            }
                        ]
                    }
                };
                const layer = { id: lineLayerid, source };
                const style = lineStyle;
                Object.assign(layer, style);
                map.addLayer(layer);
            })
        });

        startUpdate(map);
    }
    else {
        if (haslayer) maplayers.shift();
        map.removeLayer(layerid);
        stopUpdate();
    }

}