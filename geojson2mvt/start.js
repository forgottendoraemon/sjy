var fs = require('fs');
var geojson2mvt = require('./index');
const path = require('path');

const geojsondir = path.join(__dirname, '../static/mapdata');
const files = fs.readdirSync(geojsondir);
const geojson_files = files.filter((f) => f.endsWith('.geojson'));

const options = {
    layers:{},
    rootDir: path.join(__dirname, '../static/tiles'),// 输出目录z/x/y
    bbox: [
        31.5989969849999994,
        89.4044260799999932,
        39.2131070100000017,
        103.0710229200000043
    ], //[miny,minx,maxy,maxx]
    zoom: {
        min: 5,
        max: 8 //此选项22级需要调整node进程的内存大小
    }
}

for (let f of geojson_files) {
    options.layers[path.parse(f).name] = JSON.parse(fs.readFileSync(`${geojsondir}/${f}`, "utf8"));
}

geojson2mvt(options);

// 若提示内存超出，可以尝试使用 node geojson2mvt/start.js –-max-old-space-size=4096 --max-new-space-size=4096
