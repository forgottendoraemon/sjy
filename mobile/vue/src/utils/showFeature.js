import navTarget from './navTarget';
import store from '../store';

/**
 * 不同类型搜索结果的显示样式
 */
const styles = {
    Point: {
        type: "circle",
        paint: {
            "circle-color": "#d44949",
            "circle-stroke-color": "#000",
            "circle-stroke-opacity": 1,
            "circle-blur": 0
        }
    },
    LineString: {
        type: "line",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "hsl(0, 91%, 53%)", "line-width": 3 }
    },
    Polygon: {
        type: "line",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "hsl(0, 68%, 64%)", "line-width": 3 }
    }
};

/**
 * 搜索结果图层的ID
 */
const searchLayerId = "search-result";

/**
 * 将地图定位到指定要素，并返回要素的气泡位置
 */
const pantoFeature = {
    Point: (geom, map) => {
        map.flyTo({ center: geom.coordinates, zoom: 12 });
        return geom.coordinates;
    },
    LineString: (geom, map) => {
        let minx = Number.MAX_VALUE,
            miny = Number.MAX_VALUE;
        let maxx = Number.MIN_VALUE,
            maxy = Number.MIN_VALUE;
        geom.coordinates.forEach(([x, y]) => {
            minx = minx < x ? minx : x;
            miny = miny < y ? miny : y;
            maxx = maxx > x ? maxx : x;
            maxy = maxy > y ? maxy : y;
        });
        map.fitBounds([[minx, miny], [maxx, maxy]]);
        const ci = Math.floor(geom.coordinates.length / 2);
        return geom.coordinates[ci];
    },
    Polygon: (geom, map) => {
        let minx = Number.MAX_VALUE,
            miny = Number.MAX_VALUE;
        let maxx = Number.MIN_VALUE,
            maxy = Number.MIN_VALUE;
        geom.coordinates.forEach(cs =>
            cs.forEach(([x, y]) => {
                minx = minx < x ? minx : x;
                miny = miny < y ? miny : y;
                maxx = maxx > x ? maxx : x;
                maxy = maxy > y ? maxy : y;
            })
        );
        map.fitBounds([[minx, miny], [maxx, maxy]]);
        return [(minx + maxx) / 2, (miny + maxy) / 2];
    }
};
/**
 * 当前显示的搜索结果气泡
 */
var currentSearchPopup = null;

/**
 * 在地图上显示指定的要素
 * @param {*} featrue 要显示的要素
 * @param {*} nva 是否将其设置为导航目标
 */
export default function (featrue, nva = true) {
    const source = {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: featrue.geometry,
                    properties: { name: featrue.properties.name }
                }
            ]
        }
    };
    const clearFeatrue = () => {
        if ($map.getLayer(searchLayerId)) {
            $map.removeLayer(searchLayerId);
            $map.removeSource(searchLayerId);
        }
        if (currentSearchPopup) {
            currentSearchPopup.remove();
        }
    };
    clearFeatrue();
    const layer = { id: searchLayerId, source };
    const style = styles[featrue.geometry.type];
    Object.assign(layer, style);
    $map.addLayer(layer);
    // 将地图定位到搜索结果位置
    const center = pantoFeature[featrue.geometry.type](featrue.geometry, $map);
    // 显示一个名称气泡
    currentSearchPopup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(center)
        .setHTML(featrue.properties.name)
        .addTo($map);
    // 当用户点击气泡上的关闭按钮后，清除搜索结果
    currentSearchPopup.once("close", clearFeatrue);
    // 将搜索结果设置为导航目标
    if (nva) {
        // 计算几何的中心点坐标
        const geometry = featrue.geometry;
        let navTargetLatlng = navTarget(geometry);
        store.commit("setNavTargetLatlng", navTargetLatlng);
        store.commit(
            "setNavTargetName",
            featrue.properties.name
        );
    }
}