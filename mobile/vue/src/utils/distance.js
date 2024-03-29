import proj4 from "proj4";
const transform3857 = proj4("EPSG:4326", "EPSG:3857");

/**
 * 2个经纬度坐标的距离
 * @param {[lng,lat]} p1 
 * @param {[lng,lat]} p2 
 */
export function getDistance(p1, p2) {
  const [x1, y1] = transform3857.forward(p1);
  const [x2, y2] = transform3857.forward(p2);

  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

/**
 * 给定经纬度点到形状的距离平方(米)
 */
function distanceSquare(lng, lat, geometry) {
  const [x1, y1] = transform3857.forward([lng, lat]);
  if (geometry.type == "Point") {
    const [x2, y2] = transform3857.forward(geometry.coordinates);
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
  } else if (geometry.type == "Polygon") {
    const coordinates = geometry.coordinates.map(cs =>
      cs.map(p => transform3857.forward(p))
    );
    // 若在多边形内部，则直接返回0
    for (let i = 0; i < coordinates.length; i++) {
      const cs = coordinates[i];
      if (IsPointInPolygon(cs, [x1, y1])) {
        return 0;
      }
    }
    // 若在多边形外部，则计算多边形每条边与点的最小距离
    let min = Number.MAX_VALUE;
    for (let i = 0; i < coordinates.length; i++) {
      const cs = coordinates[i];
      for (let j = 0; j < cs.length - 1; j++) {
        const dp1 = cs[j];
        const dp2 = cs[j + 1];
        const { d } = getp2l(dp1, dp2, [x1, y1]);
        if (d <= 0.01) return d;
        if (d < min) {
          min = d;
        }
      }
    }
    return min;
  } else {
    return Number.MAX_VALUE;
  }
}

// 点是否在多边形内部
function IsPointInPolygon(poly, pt) {
  let i = 0,
    j = 0;
  let c = false;
  const size = poly.length;
  for (i = 0, j = size - 1; i < size; j = i++) {
    if (
      ((poly[i][1] <= pt[0] && pt[0] < poly[j][1]) ||
        (poly[j][1] <= pt[0] && pt[0] < poly[i][1])) &&
      pt.x <
      ((poly[j][0] - poly[i][0]) * (pt[0] - poly[i][1])) /
      (poly[j][1] - poly[i][1]) +
      poly[i][0]
    ) {
      c = !c;
    }
  }
  return c;
}

/**
 * 求点到线段的距离的平方及其连接点
 * @param {*} dp1 线段端点1坐标[x,y]
 * @param {*} dp2 线段端点2坐标[x,y]
 * @param {*} p 点坐标[x,y]
 */
function getp2l(dp1, dp2, p) {
  var dy = dp2[1] - dp1[1];
  var dx = dp2[0] - dp1[0];
  var x, y;
  if (dx == 0) {
    x = dp2[0];
    y = p[1];
    if (dy == 0) {
      y = dp2[1];
    }
  } else if (dy == 0) {
    x = p[0];
    y = dp2[1];
  } else {
    var k = (dp2[1] - dp1[1]) / (dp2[0] - dp1[0]);
    x = (k * k * dp1[0] + k * (p[1] - dp1[1]) + p[0]) / (k * k + 1);
    y = k * (x - dp1[0]) + dp1[1];
  }

  if (!isinline(dp1, dp2, [x, y])) {
    var d1 = getpointd2(dp1, p);
    var d2 = getpointd2(dp2, p);
    if (d1 < d2) {
      x = dp1[0];
      y = dp1[1];
    } else {
      x = dp2[0];
      y = dp2[1];
    }
  }

  return {
    d: getpointd2([x, y], p),
    x: x,
    y: y
  };
}

/**
 * 获得2个点距离的平方
 * @param {*} p1 [x,y]
 * @param {*} p2 [x,y]
 */
function getpointd2(p1, p2) {
  return (p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]);
}

/**
 * 判断一个在线段所在直线上的点，是否在线段上
 * @param {*} p1 线段端点[x,y]
 * @param {*} p2 线段端点[x,y]
 * @param {*} p 点[x,y]
 */
function isinline(p1, p2, p) {
  var minx, maxx, miny, maxy;
  if (p1[0] > p2[0]) {
    minx = p2[0];
    maxx = p1[0];
  } else {
    minx = p1[0];
    maxx = p2[0];
  }
  if (p1[1] > p2[1]) {
    miny = p2[1];
    maxy = p1[1];
  } else {
    miny = p1[1];
    maxy = p2[1];
  }
  return p[0] >= minx && p[0] <= maxx && p[1] >= miny && p[1] <= maxy;
}

export default distanceSquare;