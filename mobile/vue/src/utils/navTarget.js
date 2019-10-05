import polylabel from "polylabel";

/**
 * 计算给定几何的导航点
 */
export default function (geometry) {
    let navTargetLatlng;
    if (geometry.type == "Point") {
        navTargetLatlng = geometry.coordinates;
    } else {
        navTargetLatlng = polylabel(geometry.coordinates, 0.00001);
    }
    return navTargetLatlng;
}   