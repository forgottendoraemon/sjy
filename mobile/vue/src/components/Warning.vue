<template>
  <div></div>
</template>
<script>
/**
 * 配置哪些图层、特定名称的区域需要提供警报
 */
const warningConfig = {
  shidi: ["示例湿地1"],
  shuixi: ["江蒙错"]
};

/**
 * 触发危险区域字段报警的距离(米)
 */
const maxDistance = 100;
/**
 * 最小触发时间间隔（秒）
 */
const minTriggerSecond = 20;

var lastTriggerTime = 0;

import { mapState } from "vuex";
import distanceSquare from "../utils/distance";
import mapdata from "../assets/geojson/mapdata";

const host = location.host
  ? `${location.protocol}//${location.host}`
  : location.href.split("/index.html#/")[0];

// 初始化需要预警的要素
const warningFeatures = [];
for (let p in warningConfig) {
  const features = mapdata[p].features;
  const names = warningConfig[p];
  const fs = features.filter(f => names.indexOf(f.properties.name) != -1);
  Array.prototype.push.apply(warningFeatures, fs);
}

export default {
  computed: {
    ...mapState({
      userlocation: state => state.userlocation
    })
  },
  methods: {
    triggerAvailable() {
      return new Date().getTime() - lastTriggerTime > minTriggerSecond * 1000; //满足最小时间间隔
    },
    playAudio() {
      if (this.audio) {
        this.audio.play();
      } else {
        const audio = document.createElement("audio");
        audio.setAttribute("autoplay", "autoplay");
        audio.setAttribute("src", `${host}/static/warning.wav`);
        document.body.appendChild(audio);
        this.audio = audio;
      }

      this.audioplaying = true;
    },
    stopAduio() {
      if (this.audio) {
        this.audio.pause();
        this.audioplaying = false;
      }
    }
  },
  watch: {
    userlocation(p) {
      const maxd2 = maxDistance * maxDistance;
      let message = [];
      warningFeatures.forEach(f => {
        const geometry = f.geometry;
        const d = distanceSquare(
          p.coords.longitude,
          p.coords.latitude,
          geometry
        );
        if (d <= maxd2) {
          message.push(f.properties.name);
        }
      });
      if (message.length) {
        this.$notify({
          type: "danger",
          message: `此处有${message.join("、")}`,
          duration: 10000
        });
        this.playAudio();
        setTimeout(() => this.stopAduio(), 10000);

        lastTriggerTime = new Date().getTime();
      }
    }
  }
};
</script>
