import proj4 from "proj4";
const transform3857 = proj4("EPSG:4326", "EPSG:3857");

/**
 * 
 * @param {lng:number,lat:number} lnglat 
 */
function transform4326to3857(lnglat) {
    const [x, y] = transform3857.forward([lnglat.lng, lnglat.lat]);
    return { x, y };
}

/**
 * 
 * @param {x:number,y:number} xy 
 */
function transform3857to4326(xy) {
    const [lng, lat] = transform3857.inverse([xy.x, xy.y]);
    return { lng, lat };
}

/**
 * 计算一条折现的总长度
 * @param {} coords [[x,y],...]
*/
function getlined(coords) {
    var d = 0;
    for (var i = 1; i < coords.length; i++) {
        var p1 = coords[i - 1];
        var p2 = coords[i];
        var x1 = p1[0];
        var y1 = p1[1];
        var x2 = p2[0];
        var y2 = p2[1];
        d += Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
    }
    return d;
}

/**
 * 计算2点距离 
 * @param {*} p1 [x,y]
 * @param {*} p2 [x,y]
 */
function getpointd(p1, p2) {
    return Math.sqrt(getpointd2(p1, p2));
}

/**
 * 获得2个点距离的平方
 * @param {*} p1 [x,y]
 * @param {*} p2 [x,y]
 */
function getpointd2(p1, p2) {
    return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
}

/**
 * 判断2个道路端点是否足够接近
 * @param {*} p1 [x,y]
 * @param {*} p2 [x,y]
 */
function iss(p1, p2) {
    return Math.abs(p1[0] - p2[0]) < 0.1 && Math.abs(p1[1] - p2[1]) < 0.1;
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
    }
    else if (dy == 0) {
        x = p[0];
        y = dp2[1];
    }
    else {
        var k = (dp2[1] - dp1[1]) / (dp2[0] - dp1[0]);
        x = (k * k * dp1[0] + k * (p[1] - dp1[1]) + p[0]) / (k * k + 1)
        y = k * (x - dp1[0]) + dp1[1];
    }

    if (!isinline(dp1, dp2, [x, y])) {
        var d1 = getpointd2(dp1, p);
        var d2 = getpointd2(dp2, p);
        if (d1 < d2) {
            x = dp1[0];
            y = dp1[1];
        }
        else {
            x = dp2[0];
            y = dp2[1];
        }
    }

    return {
        d: getpointd2([x, y], p),
        x: x,
        y: y
    }
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
    }
    else {
        minx = p1[0];
        maxx = p2[0];
    }
    if (p1[1] > p2[1]) {
        miny = p2[1];
        maxy = p1[1];
    }
    else {
        miny = p1[1];
        maxy = p2[1];
    }
    return p[0] >= minx && p[0] <= maxx && p[1] >= miny && p[1] <= maxy;
}

var Graph = (function (undefined) {

    var extractKeys = function (obj) {
        var keys = [], key;
        for (key in obj) {
            Object.prototype.hasOwnProperty.call(obj, key) && keys.push(key);
        }
        return keys;
    }

    var sorter = function (a, b) {
        return parseFloat(a) - parseFloat(b);
    }

    var findPaths = function (map, start, end, infinity) {
        infinity = infinity || Infinity;

        var costs = {},
            open = { '0': [start] },
            predecessors = {},
            keys;

        var addToOpen = function (cost, vertex) {
            var key = "" + cost;
            if (!open[key]) open[key] = [];
            open[key].push(vertex);
        }

        costs[start] = 0;

        while (open) {
            if (!(keys = extractKeys(open)).length) break;

            keys.sort(sorter);

            var key = keys[0],
                bucket = open[key],
                node = bucket.shift(),
                currentCost = parseFloat(key),
                adjacentNodes = map[node] || {};

            if (!bucket.length) delete open[key];

            for (var vertex in adjacentNodes) {
                if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
                    var cost = adjacentNodes[vertex],
                        totalCost = cost + currentCost,
                        vertexCost = costs[vertex];

                    if ((vertexCost === undefined) || (vertexCost > totalCost)) {
                        costs[vertex] = totalCost;
                        addToOpen(totalCost, vertex);
                        predecessors[vertex] = node;
                    }
                }
            }
        }

        if (costs[end] === undefined) {
            return null;
        } else {
            return predecessors;
        }

    }

    var extractShortest = function (predecessors, end) {
        var nodes = [],
            u = end;

        while (u !== undefined) {
            nodes.push(u);
            u = predecessors[u];
        }

        nodes.reverse();
        return nodes;
    }

    var findShortestPath = function (map, nodes) {
        var start = nodes.shift(),
            end,
            predecessors,
            path = [],
            shortest;

        while (nodes.length) {
            end = nodes.shift();
            predecessors = findPaths(map, start, end);

            if (predecessors) {
                shortest = extractShortest(predecessors, end);
                if (nodes.length) {
                    path.push.apply(path, shortest.slice(0, -1));
                } else {
                    return path.concat(shortest);
                }
            } else {
                return null;
            }

            start = end;
        }
    }

    var toArray = function (list, offset) {
        try {
            return Array.prototype.slice.call(list, offset);
        } catch (e) {
            var a = [];
            for (var i = offset || 0, l = list.length; i < l; ++i) {
                a.push(list[i]);
            }
            return a;
        }
    }

    var Graph = function (map) {
        this.map = map;
    }

    Graph.prototype.findShortestPath = function (start, end) {
        if (Object.prototype.toString.call(start) === '[object Array]') {
            return findShortestPath(this.map, start);
        } else if (arguments.length === 2) {
            return findShortestPath(this.map, [start, end]);
        } else {
            return findShortestPath(this.map, toArray(arguments));
        }
    }

    Graph.findShortestPath = function (map, start, end) {
        if (Object.prototype.toString.call(start) === '[object Array]') {
            return findShortestPath(map, start);
        } else if (arguments.length === 3) {
            return findShortestPath(map, [start, end]);
        } else {
            return findShortestPath(map, toArray(arguments, 1));
        }
    }

    return Graph;

})();

/**
 * 从道路图层的geojson数据创建节点连接信息(3857坐标系)
 * @param {*} geojsondata 
 */
function createGraphMapFromGeojson(geojsondata) {
    var gd = {};
    var data = geojsondata;

    var linedmap = {};

    var linelist = data.features.map(function (f) {
        var coords = f.geometry.coordinates;
        var id = f.properties.id;
        var sid = id + "-a";
        var eid = id + "-b";
        var s = { coord: coords[0], id: sid };
        var e = { coord: coords[coords.length - 1], id: eid };
        var d = getlined(coords);

        linedmap[id] = d;

        return { s, e, d };
    });

    linelist.forEach(function (line) {
        setp(line.s, line.e, line.d);
        linelist.forEach(function (oline) {
            if (oline != line) {
                var a = [oline.s, oline.e];
                a.forEach(function (p) {
                    if (gd[line.s.id][p.id] === undefined) {
                        if (iss(line.s.coord, p.coord)) {
                            setp(line.s, p, 0);
                        }
                        else {
                            setp(line.s, p, null);
                        }
                        if (iss(line.e.coord, p.coord)) {
                            setp(line.e, p, 0);
                        }
                        else {
                            setp(line.e, p, null);
                        }
                    }
                });
            }
        })
    });

    function setp(s, e, d) {
        gd[s.id] = gd[s.id] || {};
        gd[s.id][e.id] = d;

        gd[e.id] = gd[e.id] || {};
        gd[e.id][s.id] = d;
    }

    for (var p in gd) {
        var d = gd[p];
        var nullps = [];
        for (var n in d) {
            if (d[n] === null) {
                nullps.push(n);
            }
        }
        nullps.forEach(function (n) {
            delete d[n];
        });
    }
    return { graphMap: gd, linedmap: linedmap };
}

/**
 * 初始化图
 * @param {*} gd 使用createGraphMapFromGeojson创建的连接信息对象
 * @param {*} geojosn4326 道路的geojson对象(GPS坐标系)
 * @param {*} geojosn3857 道路的geojson对象(3857投影坐标系)
 */
function init(gd, geojosn4326, geojosn3857) {
    this.graph = new Graph(gd.graphMap);
    this.linedmap = gd.linedmap;
    this.roaddata4326 = geojosn4326;
    this.roaddata3857 = geojosn3857;
    this.inited = true;
}

/**
* 查找指定起止节点的最短路径
* @param {*} sid 起点ID
* @param {*} eid 终点ID
*/
function findShortestPath(sid, eid) {
    var result = Routing.graph.findShortestPath(sid, eid);

    if (result == null) {
        return;
    }

    var result_lines = [];
    var idcountmap = {};

    result.forEach(function (r) {
        var id = parseInt(r.split('-')[0]);
        idcountmap[id] = idcountmap[id] || 0;
        idcountmap[id]++;
        if (idcountmap[id] == 2) {
            result_lines.push(id);
        }
    });

    var dsum = result_lines.length == 0 ? 0 : result_lines.reduce(function (p, c) {
        return (p || 0) + Routing.linedmap[c];
    });

    return {
        result,
        result_lines,
        dsum
    }
}

/**
 * 查找与指定点最近的道路ID、连接点到道路2端的路径
 * @param {*} p 点坐标[x,y] 投影坐标3857
 */
function findPoint(p) {
    var mind = Number.MAX_VALUE;
    var minid, // 距离点最近的道路ID
        minpoint, // 点到道路线段的垂足点
        minlineindex,// 垂足点所在线段的索引
        mincoords; // 距离最短的道路坐标集合
    Routing.roaddata3857.features.forEach(function (f) {
        var coords = f.geometry.coordinates;
        var id = f.properties.id;
        for (var i = 1; i < coords.length; i++) {
            var s = coords[i - 1]
            var e = coords[i];
            var ptd = getp2l(s, e, p);
            if (ptd.d < mind) {
                mind = ptd.d;
                minid = id;
                minpoint = [ptd.x, ptd.y];
                minlineindex = i - 1;
                // isna = coords.length / i > 2;
                mincoords = coords;
            }
        }
    });

    // 计算垂足点到线路2端点的路径坐标
    var ps2start = []; //到起点
    var ps2end = [];//到终点
    ps2start.push(minpoint);
    for (var i = minlineindex; i >= 0; i--) {
        ps2start.push([mincoords[i][0], mincoords[i][1]]);
    }
    ps2end.push(minpoint);
    for (var i = minlineindex + 1; i < mincoords.length; i++) {
        ps2end.push([mincoords[i][0], mincoords[i][1]]);
    }

    return {
        minid, // 距离点最近的道路ID
        ps2start, // 垂足点到线路起点的路径坐标
        ps2end, // 垂足点到线路终点的路径坐标
        minlineindex, //垂足点所在线段的索引
        minpoint, // 点到道路线段的垂足点
        mincoords,
        mind
    };
}

/**
* 查找2个坐标点之间的路径
* 返回值：
* {
* path:[[point...],...] 结果路径集合
* distance:Number 路径总长(米)
* }
* @param {*} startLatlng 起点坐标{lat,lng}
* @param {*} endLatlng 终点坐标{lat,lng}
*/
function findRouting(startLatlng, endLatlng) {
    if (!Routing.inited) throw "尚未初始化路径数据，调用Routing.init初始化";

    var s = transform4326to3857(startLatlng);
    var e = transform4326to3857(endLatlng);
    var sinfo = findPoint([s.x, s.y]);
    var einfo = findPoint([e.x, e.y]);

    if (sinfo.mind > 30000) {
        throw "起点附近未搜索到路网";
    }
    if (einfo.mind > 30000) {
        throw "终点附近未搜索到路网";
    }

    var mind = Number.MAX_VALUE;
    // 路径分为三段：中间段，起点段，终点段
    var minpath, minspath, minepath;

    // 如果起点和终点是在同一条路上
    if (sinfo.minid == einfo.minid) {
        minepath = [sinfo.minpoint];
        if (sinfo.minlineindex <= einfo.minlineindex) {
            for (var i = sinfo.minlineindex + 1; i <= einfo.minlineindex; i++) {
                minepath.push(sinfo.mincoords[i]);
            }
        }
        else {
            for (var i = sinfo.minlineindex; i > einfo.minlineindex-1; i--) {
                minepath.push(sinfo.mincoords[i]);
            }
        }
        minepath.push(einfo.minpoint);
        mind = getlined(minepath);
    }
    else {
        var startidf = ["-a", "-a", "-b", "-b"];
        var endidf = ["-a", "-b", "-a", "-b"];
        var spoints = [sinfo.ps2start, sinfo.ps2start, sinfo.ps2end, sinfo.ps2end];
        var epoints = [einfo.ps2start, einfo.ps2end, einfo.ps2start, einfo.ps2end];

        // 计算四种路径，确定最短路径
        for (var i = 0; i < 4; i++) {
            var path = findShortestPath(sinfo.minid + startidf[i], einfo.minid + endidf[i]);
            if (path == null) {
                throw "找不到联通的路径"
            }
            var d = path.dsum + getlined(spoints[i]) + getlined(epoints[i]);
            if (d < mind) {
                mind = d;
                minpath = path;
                minspath = spoints[i];
                minepath = epoints[i];
            }
        }
    }

    var minspath4326 = minspath ? minspath.map(p => transform3857to4326({ x: p[0], y: p[1] })) : [];
    var minedpath4326 = minepath ? minepath.map(p => transform3857to4326({ x: p[0], y: p[1] })) : [];

    var result_path = [];
    // 起点段
    result_path.push(minspath4326);
    // 中间段
    if (minpath && minpath.result_lines) {
        minpath.result_lines.forEach(function (id) {
            var line = Routing.roaddata4326.features.filter(f => f.properties.id == id)[0];
            var linecoord = line.geometry.coordinates.map(c => ({lng:c[0],lat:c[1]}));
            result_path.push(linecoord);
        });
    }
    // 终点段
    result_path.push(minedpath4326);
    return {
        path: result_path,
        distance: mind
    };
}

const Routing = {
    createGraphMapFromGeojson,
    init,
    findRouting
};

export default Routing