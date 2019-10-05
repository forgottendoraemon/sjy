<template>
  <div class="info-page">
    <van-nav-bar :title="title" left-text="地图" left-arrow @click-left="onClickLeft" />
    <van-swipe :autoplay="3000" :height="250">
      <van-swipe-item v-for="(image, index) in images" :key="index">
        <van-image width="100%" height="100%" fit="cover" :src="image" />
      </van-swipe-item>
    </van-swipe>

    <van-panel title="介绍" class="info-cont">
      <div class="info-text">{{info}}</div>
    </van-panel>

    <div class="info-actions">
      <van-button v-if="!audioplaying" icon="play-circle-o" type="primary" @click="playAudio">语音介绍</van-button>
      <van-button v-if="audioplaying" icon="stop-circle-o" type="primary" @click="stopAduio">停止播放</van-button>
      <van-button icon="exchange" type="info" @click="startNav">导航到此</van-button>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import navTarget from '../utils/navTarget'

const host = location.host
  ? `${location.protocol}//${location.host}`
  : location.href.split("/index.html#/")[0];


export default {
  data() {
    return {
      audioplaying: false
    };
  },
  methods: {
    onClickLeft() {
      this.$router.replace("/");
    },
    playAudio() {
      if (this.audio) {
        this.audio.play();
      } else {
        const audio = document.createElement("audio");
        audio.setAttribute("autoplay", "autoplay");
        audio.setAttribute(
          "src",
          `${host}/static/audio/${this.selectScenicSpot.ext.audio}`
        );
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
    },
    startNav() {
      // 计算几何的中心点坐标
      const geometry = this.selectScenicSpot.feature.geometry;
      let navTargetLatlng = navTarget(geometry);
      
      this.$router.replace("/");

      this.$store.commit("setNavTargetLatlng", navTargetLatlng);
      this.$store.commit(
        "setNavTargetName",
        this.selectScenicSpot.feature.properties.name
      );
      this.$store.commit("setIsRouting",true);
      
    }
  },
  components: {},
  computed: {
    ...mapState({
      selectScenicSpot: state => state.selectScenicSpot
    }),
    title() {
      return this.selectScenicSpot.feature.properties.name;
    },
    images() {
      return this.selectScenicSpot.ext.photos
        .split(";")
        .map(img => `${host}/static/photo/${img}`);
    },
    info() {
      return this.selectScenicSpot.ext.info;
    }
  },
  mounted() {},

  beforeRouteLeave(to, from, next) {
    if (this.audio) {
      this.audio.pause();
      document.body.removeChild(this.audio);
      this.audio = null;
      this.audioplaying = false;
    }
    next();
  }
};
</script>
<style lang="less" scoped>
.info-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.info-cont {
  flex-grow: 1;
}

.image-div {
  height: 100%;
  width: 100%;
  background-size: cover;
}
.info-text,
.info-audio {
  padding: 10px 16px;
}

.info-actions {
  display: flex;
  button {
    flex-grow: 1;
    border: none;
    border-radius: 0;
  }
}
</style>