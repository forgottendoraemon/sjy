<template>
  <div></div>
</template>
<script>
import mapdata from "../../assets/geojson/mapdata";
import { mapState } from "vuex";
import extdata from "../../assets/geojson/extdata.json";

import distanceSquare from "../../utils/distance";

/**
 * 触发自动景点介绍的最大距离（米）
 */
const maxDistance = 100;
/**
 * 最小触发时间间隔（秒）
 */
const minTriggerSecond = 10;
/**
 * 配置具有自动跳转到介绍页的图层
 */
const autolayers = ["shidi", "shuixi"];

/**
 * 记录上次触发的时间
 */
let lastTriggerTime = new Date();
/**
 * 上次触发的景点ID
 */
let lastTriggerId;

export default {
  data() {
    return {};
  },
  methods: {
    triggerAvailable() {
      return (
        this.$router.currentRoute.name == "map" && // 用户处在地图页
        !this.isRouting &&
        new Date().getTime() - lastTriggerTime > minTriggerSecond * 1000
      ); //满足最小时间间隔
    }
  },
  computed: {
    ...mapState({
      userlocation: state => state.userlocation,
      isRouting: state => state.isRouting
    })
  },
  watch: {
    userlocation(p) {
      if (this.triggerAvailable()) {
        let mind = Number.MAX_VALUE;
        let mindFeature;
        autolayers.forEach(layer => {
          mapdata[layer].features.forEach(f => {
            const geometry = f.geometry;
            const d = distanceSquare(
              p.coords.longitude,
              p.coords.latitude,
              geometry
            );
            if (d < mind) {
              mindFeature = f;
              mind = d;
            }
          });
          if (mind <= maxDistance * maxDistance) {
            // 满足自动触发的条件
            const id = mindFeature.properties.id;
            const tid = `${layer}-${id}`;
            if (lastTriggerId != tid) {
              const ext = extdata[layer][id];
              if (ext) {
                lastTriggerTime = new Date().getTime();
                lastTriggerId = tid;
                const selectScenicSpot = { feature: mindFeature, ext };
                this.$store.commit("setSelectScenicSpot", selectScenicSpot);
                this.$router.push("/info");
              }
            }
          }
        });
      }
    }
  }
};
</script>
<style lang="less" scoped>
</style>