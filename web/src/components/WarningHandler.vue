<template>
  <div></div>
</template>
<script>
import axios from "../assets/js/axios";
import { mapState } from "vuex";

var timer = null;
/**
 * 预警状态更新间隔(ms)
 */
const timeInterval = 5 * 1000;

export default {
  computed: {
    ...mapState({
      WarningLevel: state => state.WarningLevel,
      peopleCount: state => state.peopleCount,
      userinfo: state => state.userinfo
    })
  },
  methods: {
    startUpdateWarningLevel() {
      const updateWarningLevel = () => {
        this.$store.dispatch("updateWarningLevel").then(() => {
          timer = setTimeout(updateWarningLevel, timeInterval);
        });
      };
      updateWarningLevel();
    },
    stopUpdateWarningLevel() {
      clearTimeout(timer);
    }
  },
  mounted() {
    if (
      this.userinfo &&
      (this.userinfo.roles == "admin" || this.userinfo.roles == "worker")
    ) {
      this.startUpdateWarningLevel();
    } else {
      this.stopUpdateWarningLevel();
    }
  },
  create() {},
  watch: {
    /**当出现预警时*/
    WarningLevel(newvalue) {
      const time = new Date();
      const timeStr = `${time.getFullYear()}-${time.getMonth() +
        1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;

      if (newvalue) {
        // 声音
        const audio = document.createElement("audio");
        audio.setAttribute("autoplay", "autoplay");
        audio.setAttribute("src", "audio/warning.wav");
        document.body.appendChild(audio);
        // 弹框
        const colormap = {
          "1": "#00f",
          "2": "#f7a326",
          "3": "#f00"
        };
        this.$message({
          message: `时间:${timeStr}&nbsp超员<b style="color:${
            colormap[newvalue.level]
          }">${newvalue.name}</b>(${this.peopleCount}人)`,
          type: "warning",
          duration: 0,
          showClose: true,
          dangerouslyUseHTMLString: true,
          offset: 80,
          onClose: () => {
            document.body.removeChild(audio);
          }
        });
      } else {
        // 解除警报
        this.$message({
          message: `时间:${timeStr}&nbsp超员预警解除(${this.peopleCount}人)`,
          type: "success",
          duration: 0,
          showClose: true,
          dangerouslyUseHTMLString: true,
          offset: 80
        });
      }
    },
    userinfo(userinfo) {
      if (
        userinfo &&
        (userinfo.roles == "admin" || userinfo.roles == "worker")
      ) {
        this.startUpdateWarningLevel();
      } else {
        this.stopUpdateWarningLevel();
      }
    }
  }
};
</script>
