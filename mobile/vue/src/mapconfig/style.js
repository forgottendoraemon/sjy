const host = location.host ? `${location.protocol}//${location.host}` : location.href.split("/index.html#/")[0];
mapboxgl.accessToken = "none";
export default {
    "version": 8,
    "name": "Blank",
    "metadata": {
        "mapbox:autocomposite": true,
        "mapbox:type": "template",
        "mapbox:sdk-support": {
            "js": "0.54.0",
            "android": "7.4.0",
            "ios": "4.11.0"
        }
    },
    "center": [99.08313660502631, 34.75840285686732],
    "zoom": 6,
    "bearing": 0,
    "pitch": 0,
    "sources": {
        "composite": {
            "type": "vector",
            "tiles": [`${host}/static/tiles/{z}/{x}/{y}.mvt`]
        }
    },
    "sprite": `${host}/static/mapboxgl/sprite`,
    "glyphs": `${host}/static/mapboxgl/{fontstack}/{range}.pbf`,
    "layers": [
        {
            "id": "background",
            "type": "background",
            "layout": {},
            "paint": { "background-color": "#efe9e1" }
        },
        {
            "id": "xingzhengquhua",
            "type": "line",
            "source": "composite",
            "source-layer": "shengjie",
            "layout": { "line-cap": "round", "line-join": "round" },
            "paint": {
                "line-color": "#a6a6a6",
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    7,
                    0.75,
                    12,
                    1.5
                ],
                "line-dasharray": [2, 2, 6, 2]
            }
        },
        {
            "id": "quhua",
            "type": "line",
            "source": "composite",
            "source-layer": "quhua",
            "layout": { "line-cap": "round", "line-join": "round" },
            "paint": {
                "line-color": "#808080",
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    3,
                    0.5,
                    10,
                    2
                ]
            }
        },
        {
            "id": "shuixi",
            "type": "fill",
            "source": "composite",
            "source-layer": "shuixi",
            "layout": {},
            "paint": { "fill-color": "#78bced" }
        },
        {
            "id": "shidi",
            "type": "fill",
            "source": "composite",
            "source-layer": "shidi",
            "layout": {},
            "paint": {
                "fill-color": "#c8dd97",
                "fill-opacity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    5,
                    0,
                    6,
                    0.5
                ]
            }
        },
        {
            "id": "xiangdao",
            "type": "line",
            "source": "composite",
            "source-layer": "xiangdao",
            "layout": { "line-cap": "round", "line-join": "round" },
            "paint": {
                "line-color": "#fff",
                "line-width": [
                    "interpolate",
                    ["exponential", 1.5],
                    ["zoom"],
                    13,
                    0.5,
                    15,
                    1.8,
                    18,
                    15
                ]
            }
        },
        {
            "id": "xiandao",
            "type": "line",
            "source": "composite",
            "source-layer": "xiandao",
            "layout": { "line-cap": "round", "line-join": "round" },

            "paint": {
                "line-color": "#ffffff",
                "line-width": [
                    "interpolate",
                    ["exponential", 1.5],
                    ["zoom"],
                    12,
                    0.5,
                    14,
                    2,
                    18,
                    18
                ]
            }
        },
        {
            "id": "shengdao",
            "type": "line",
            "source": "composite",
            "source-layer": "shengdao",
            "layout": { "line-cap": "round", "line-join": "round" },
            "paint": {
                "line-color": "#fff",
                "line-width": [
                    "interpolate",
                    ["exponential", 1.5],
                    ["zoom"],
                    5,
                    0.75,
                    18,
                    32
                ]
            }
        },
        {
            "id": "guodao-case",
            "type": "line",
            "source": "composite",
            "source-layer": "guodao",
            "layout": { "line-cap": "round", "line-join": "round" },
            "paint": {
                "line-width": [
                    "interpolate",
                    ["exponential", 1.5],
                    ["zoom"],
                    10,
                    1,
                    18,
                    2
                ],
                "line-color": "#fff",
                "line-gap-width": [
                    "interpolate",
                    ["exponential", 1.5],
                    ["zoom"],
                    5,
                    0.75,
                    18,
                    32
                ]
            }
        },
        {
            "id": "guodao",
            "type": "line",
            "source": "composite",
            "source-layer": "guodao",
            "layout": { "line-cap": "round", "line-join": "round" },
            "paint": {
                "line-color": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0,
                    "#f2934a",
                    6,
                    "#f2934a",
                    9,
                    "#ffa35c"
                ],
                "line-width": [
                    "interpolate",
                    ["exponential", 1.5],
                    ["zoom"],
                    5,
                    0.75,
                    18,
                    32
                ]
            }
        },
        {
            "id": "poi",
            "type": "symbol",
            "source": "composite",
            "source-layer": "poi",
            "layout": {
                "text-field": ["to-string", ["get", "name"]],
                "text-size": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    13,
                    0,
                    13.1,
                    12
                ]
            },
            "paint": {
                "text-color": "#cb7b4d",
                "text-halo-width": 0.5,
                "text-halo-blur": 0.5,
                "text-halo-color": "#fff"
            }
        },
        {
            "id": "cun",
            "type": "symbol",
            "source": "composite",
            "source-layer": "cun",
            "layout": {
                "text-field": ["to-string", ["get", "name"]],
                "text-size": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    9,
                    0,
                    10,
                    10,
                    14,
                    16
                ]
            },
            "paint": {}
        },
        {
            "id": "xiangdao-label",
            "type": "symbol",
            "source": "composite",
            "source-layer": "xiangdao",
            "filter": [
                "all",
                ["match", ["get", "name"], ["null"], false, true],
                ["has", "name"]
            ],
            "layout": {
                "text-field": ["to-string", ["get", "name"]],
                "text-size": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    10,
                    8,
                    18,
                    14
                ],
                "text-letter-spacing": 0.01,
                "symbol-placement": "line",
                "text-max-angle": 30,
                "text-rotation-alignment": "map",
                "text-padding": 1
            },
            "paint": {
                "text-halo-color": "#fff",
                "text-halo-width": 1,
                "text-halo-blur": 1
            }
        },
        {
            "id": "xiandao-label",
            "type": "symbol",
            "source": "composite",
            "source-layer": "xiandao",
            "filter": [
                "all",
                ["match", ["get", "name"], ["null"], false, true],
                ["has", "name"]
            ],
            "layout": {
                "text-field": ["to-string", ["get", "name"]],
                "text-size": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    10,
                    10,
                    18,
                    16
                ],
                "symbol-placement": "line"
            },
            "paint": {
                "text-halo-color": "#fff",
                "text-halo-width": 1,
                "text-halo-blur": 1
            }
        },
        {
            "id": "shengdao-label",
            "type": "symbol",
            "source": "composite",
            "source-layer": "shengdao",
            "minzoom": 6,
            "layout": {
                "text-letter-spacing": 0.05,
                "text-field": ["to-string", ["get", "name"]],
                "text-size": 9,
                "text-rotation-alignment": "viewport",
                "icon-rotation-alignment": "viewport",
                "icon-image": "rectangle-yellow-3",
                "symbol-placement": "line"
            },
            "paint": {}
        },
        {
            "id": "xiangzhen",
            "type": "symbol",
            "source": "composite",
            "source-layer": "xiangzhen",
            "layout": {
                "text-field": ["to-string", ["get", "name"]],
                "text-size": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    5,
                    8,
                    16,
                    16
                ],
                "text-max-width": 7
            },
            "paint": {}
        }
    ],
    "created": "2019-08-03T12:29:49.661Z",
    "id": "cjyvil68d12ze1cmz8wxayrcp",
    "modified": "2019-08-04T08:05:50.298Z",
    "owner": "498814515",
    "visibility": "private",
    "draft": false
}