<template>
  <!-- TODO:样式自行修改，要修改内容也是自己改 -->
  <form class="search-box" @submit.prevent="searchResult" action="/">
    <!-- <form method="POST" @submit.prevent="RegisterLogin" ref="userForm"> -->
    <van-search
      v-model="searchValue"
      placeholder="输入关键字搜索"
      :show-action="showAction"
      @search="onSearch"
      @cancel="onCancel"
      @focus="onFocus"
      @blur="onBlur"
      class="search"
      background="#f7f7f7"
    />
    <!-- 搜索内容的显示 -->
    <div v-if="isHaveSearchResult" :style="{maxHeight:searchHeight+'px'}" class="search-content">
      <template v-for="(item,index) in searchResult">
        <p class="item" :key="index" @click="findElement(item.feature)">
          <van-row>
            <van-col span="22">{{item.name}}</van-col>
            <!-- 搜索内容数的图标 -->
            <van-col span="2">
              <span class="iconfont colorblue"></span>
            </van-col>
          </van-row>
        </p>
      </template>
      <!-- <p style="color:#ccc" v-if="searchResult.length==0">无</p> -->
    </div>
  </form>
</template>
<script>
import mapdata from "../../assets/geojson/mapdata";

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
      searchValue: "",
      showAction: false,
      resultList: []
    };
  },
  computed: {
    searchHeight() {
      return document.body.offsetHeight / 3;
    },
    searchResult() {
      return this.resultList;
    },
    isHaveSearchResult() {
      return this.showAction && this.searchResult.length !== 0;
    }
  },
  methods: {
    onSearch(val) {
      let key = val.trim();
      if (key) {
        const resultFeatures = [];
        for (let p in mapdata) {
          const layerdata = mapdata[p].features;
          const rs = layerdata.filter(
            f => f.properties.name && f.properties.name.indexOf(key) != -1
          );
          Array.prototype.push.apply(resultFeatures, rs);
        }

        if (resultFeatures.length) {
          this.resultList = resultFeatures.map(f => ({
            name: f.properties.name,
            feature: f
          }));
          console.log(this.resultList);
        } else {
          this.resultList = [
            {
              name: "没有搜索结果",
              feature: false
            }
          ];
        }
      }
    },
    onCancel() {
      this.showAction = false;
    },
    onFocus() {
      this.showAction = true;
      if (!this.searchValue) {
        this.resultList = [];
      }
    },
    onBlur() {
      if (!this.searchValue) {
        this.showAction = false;
      }
    },
    /**
     * 定位到选中的搜索结果
     */
    findElement(e) {
      if (!e) return;
      this.showAction = false;
      // 将选中的搜索结果显示在地图上
      const source = {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: e.geometry,
              properties: { name: e.properties.name }
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
      const style = styles[e.geometry.type];
      Object.assign(layer, style);
      this.$map.addLayer(layer);
      // 将地图定位到搜索结果位置
      const center = pantoFeature[e.geometry.type](e.geometry, this.$map);
      // 显示一个名称气泡
      currentSearchPopup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(center)
        .setHTML(e.properties.name)
        .addTo(this.$map);
      // 当用户点击气泡上的关闭按钮后，清除搜索结果
      currentSearchPopup.once("close", clearFeatrue);
    }
  }
};
</script>
<style lang="less" scoped>
.search-box {
  z-index: 1000;
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;

  .search {
    border-radius: 3px;
  }
  .search-content {
    width: 100%;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    background-color: rgba(255, 255, 255, 0.9);
    overflow: auto;
    padding: 10px 20px;
    /deel/.van-search__content {
      background-color: #ffffff;
    }
    .item {
      border-bottom: 1px solid #ededed;
      color: #535353;
      /*padding: 10px 0;*/
    }
  }
  .colorblue {
    color: blue;
  }
}
</style>