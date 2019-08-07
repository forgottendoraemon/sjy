<template>
  <div class="search">
    <el-autocomplete
      v-model="query"
      :fetch-suggestions="querySearch"
      :trigger-on-focus="false"
      :hide-loading="true"
      placeholder="关键字搜索"
      class="my-autocomplete"
      size="small"
      :clearable="true"
      :select-when-unmatched="true"
    >
      <template slot-scope="{ item }">
        <div class="name text-overflow" @click="findElement(item)">{{ item.name }}</div>
      </template>
    </el-autocomplete>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "../../assets/js/axios";
import maplayers from "../../mapconfig/maplayers";

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

export default {
  data() {
    return {
      query: ""
    };
  },
  computed: {
    ...mapState({
      currentPoint: state => state.build.currentPoint // 当前选中的图元信息
    })
  },
  methods: {
    /**
     * @desc 搜索全部子图层
     * @param {String} queryString 查询的文字
     * @param {Function} cb 回调函数(将结果通过参数传递)
     */
    querySearch(queryString, cb) {
      if (queryString.trim() === "") {
        cb([{ name: "没有搜索结果" }]);
        return;
      }
      axios
        .get(`/api/mapdata/search/${queryString.trim()}`)
        .then(({ data }) => {
          if (data.length === 0) {
            cb([{ name: "没有搜索结果" }]);
          } else {
            const rs = [];
            data.forEach(d => {
              const layerCnName = maplayers.filter(l => l.source === d.layer)[0]
                .name;
              d.rows.forEach(r => {
                rs.push(r);
              });
            });
            cb(rs);
          }
        });
    },
    /**
     * 定位到选中的搜索结果
     */
    findElement(e) {
      // 将选中的搜索结果显示在地图上
      const source = {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: e.geom,
              properties: { name: e.name }
            }
          ]
        }
      };
      const clearFeatrue = () => {
        if (this.$map.getLayer(searchLayerId)) {
          this.$map.removeLayer(searchLayerId);
          this.$map.removeSource(searchLayerId);
        }
        if (currentSearchPopup) {
          currentSearchPopup.remove();
        }
      };
      clearFeatrue();
      const layer = { id: searchLayerId, source };
      const style = styles[e.geom.type];
      Object.assign(layer, style);
      this.$map.addLayer(layer);
      // 将地图定位到搜索结果位置
      const center = pantoFeature[e.geom.type](e.geom, this.$map);
      // 显示一个名称气泡
      currentSearchPopup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(center)
        .setHTML(e.name)
        .addTo(this.$map);
      // 当用户点击气泡上的关闭按钮后，清除搜索结果
      currentSearchPopup.once("close", clearFeatrue);
    }
  },
  watch: {}
};
</script>

<style scoped lang="scss">
.search {
  width: 320px;
  padding: 10px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  .region-autocomplete {
    width: 100px;
    margin-right: 10px;
  }
}
.my-autocomplete {
  width: 320px;
  li: {
    line-height: 1;
    background: #aaa;
  }
}

.address {
  font-size: 12px;
  color: #b4b4b4;
  font-weight: 400;
}
</style>
