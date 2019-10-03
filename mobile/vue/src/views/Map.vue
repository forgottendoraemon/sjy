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
import Aside from '@/components/Map/Aside'
export default {
  data() {
    return {
      isMinZoom: false,
      isMaxZoom: false
    }
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

    }
  },
  components: {
    Search,
    Aside
  },
  computed: {
    // Resize
  },
  mounted() {
    //初始化地图
    this.initMap();
  },
  //路由卫士
  beforeRouteEnter: (to, from, next) => {
    next(vm => {
      //调整
      vm.$map && vm.$map.resize();
    })
  }
}
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