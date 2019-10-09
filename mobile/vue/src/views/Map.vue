<template>
  <div class="map-box">
    <div id="map-wrap"></div>
    <Aside :isMinZoom="isMinZoom" :isMaxZoom="isMaxZoom" />
    <Search />
    <AutoInfo />
    <Routinger />
  </div>
</template>
<script>
import Vue from "vue";
import Search from "@/components/Map/Search";
import mapstyle from "../mapconfig/style";
import maplayers from '../mapconfig/maplayers';
import mapdata from "../assets/geojson/mapdata";
import Aside from "@/components/Map/Aside";
import { mapState } from "vuex";
import extdata from "../assets/geojson/extdata.json";
import AutoInfo from "@/components/Map/AutoInfo";
import Routinger from "@/components/Map/Routinger";
import navTarget from "../utils/navTarget";

const userlocationLayerId = "userlocation";
let firstLocation = true;

export default {
  data() {
    return {
      isMinZoom: false,
      isMaxZoom: false
    };
  },
  methods: {
    initMap() {
      /**
       * 将数据源替换为json数据源
       */

      mapstyle.sources = {};
      for (let p in mapdata) {
        mapstyle.sources[p] = {
          type: "geojson",
          data: mapdata[p]
        };
      }
      mapstyle.layers.forEach(layer => {
        const src = layer["source-layer"];
        if (src) {
          layer.source = src;
          delete layer["source-layer"];
        }
      });

      const mymap = new mapboxgl.Map({
        container: "map-wrap",
        style: mapstyle,
        minZoom: 5,
        maxZoom: 18,
        dragRotate:false
      });
      mymap.touchZoomRotate.disableRotation();
      Vue.prototype.$map = mymap;
      window.$map = mymap;

      mymap.on("load", () => {
        this.$store.commit("setMapLoad",true);
      });
    },
    /**
     * 添加用户位置图层
     */
    createUserLocationLayer() {
      this.$map.on("load", () => {
        this.$map.addLayer({
          id: userlocationLayerId,
          source: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: []
            }
          },
          type: "circle",
          paint: {
            "circle-color": "#1f62e0",
            "circle-radius": 6.5
          },
          layout: {}
        });
      });
    },
    /**
     * 用户点击图层上的要素，跳转到info页面
     */
    intiClickInfo() {
      for (let p in extdata) {
        this.$map.on("click", p, evt => {
          const [feature] = evt.features;
          const id = feature.properties.id;
          const ext = extdata[p][id];
          if (ext) {
            const selectScenicSpot = { feature, ext };
            this.$store.commit("setSelectScenicSpot", selectScenicSpot);
            this.$router.push("/info");
          }
        });
      }
    },

    /**
     * 设置导航目标的交互
     */
    initNavTarget() {
      // 点击地图上的要素
      // 可以导航的图层
      const canNavLayers = ["shuixi", "shidi", "cun"];

      canNavLayers.forEach(layer => {
        this.$map.on("click", layer, evt => {
          const [feature] = evt.features;
          let navTargetLatlng = navTarget(feature.geometry);
          this.$store.commit("setNavTargetLatlng", navTargetLatlng);
          this.$store.commit("setNavTargetName", feature.properties.name);
        });
      });

      // 长按空白处设置导航目标
      this.$map.on("contextmenu", ({ lngLat }) => {
        this.$store.commit("setNavTargetLatlng", [lngLat.lng, lngLat.lat]);
        this.$store.commit("setNavTargetName", "地图上的点");
      });
      this.$map.on("click", evt => {});
    }
  },
  components: {
    Search,
    Aside,
    AutoInfo,
    Routinger
  },
  computed: {
    ...mapState({
      userlocation: state => state.userlocation
    })
  },
  watch: {
    userlocation(val) {
      const locationSrc = this.$map.getSource(userlocationLayerId);
      if (locationSrc) {
        const geojsonData = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [val.coords.longitude, val.coords.latitude]
              },
              properties: {}
            }
          ]
        };
        locationSrc.setData(geojsonData);
      }
      // 有时首次定位显示不出定位图标
      if(firstLocation){
        this.$map.resize();
        firstLocation = false;
      }
    }
  },
  mounted() {
    //初始化地图
    this.initMap();
    //创建用户位置图层
    this.createUserLocationLayer();
    //启动定位
    this.$store.dispatch("startWatchLocation");
    //inofo信息页面
    this.intiClickInfo();
    //操作地图设置导航目标
    this.initNavTarget();
  },
  //路由卫士
  beforeRouteEnter: (to, from, next) => {
    next(vm => {
      //调整
      vm.$map && vm.$map.resize();
    });
  }
};
</script>
<style lang="less" scoped>
.map-box {
  width: 100%;
  height: 100%;
  position: relative;
  #map-wrap {
    width: 100%;
    height: 100%;
  }
}
</style>