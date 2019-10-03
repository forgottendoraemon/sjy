<template>
  <div class="map-box">
    <div id="map-wrap"></div>
    <Aside :isMinZoom="isMinZoom" :isMaxZoom="isMaxZoom" />
    <Search />
  </div>
</template>
<script>
import Vue from "vue";
import Search from "@/components/Map/Search";
import mapstyle from "../mapconfig/style";
import maplayers from "../mapconfig/maplayers";
import Aside from "@/components/Map/Aside";
import { mapState } from "vuex";

const userlocationLayerId = "userlocation";

export default {
  data() {
    return {
      isMinZoom: false,
      isMaxZoom: false
    };
  },
  methods: {
    initMap() {
      const mymap = new mapboxgl.Map({
        container: "map-wrap",
        style: mapstyle,
        minZoom: 5,
        maxZoom: 18
      });
      Vue.prototype.$map = mymap;
      window.$map = mymap;
      /**
       * TODO:
       * 定义监听地图zoom变化事件 判断地图是否是最大级别了和最小级别了
       * 设置 isMinZoom isMaxZoom
       */
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
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [98.04180297572702, 34.64370896168853]
                  },
                  properties: {}
                }
              ]
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
    }
  },
  components: {
    Search,
    Aside
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
    }
  },
  mounted() {
    //初始化地图
    this.initMap();
    //创建用户位置图层
    this.createUserLocationLayer();
    //启动定位
    this.$store.dispatch("startWatchLocation");
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