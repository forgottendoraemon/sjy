<template>
  <div>
    <!-- 用户 -->
    <div class="button-box button-top-box">
      <!-- <van-button class="map-button" @click.stop="openUser" type="default">
        <van-icon :name="isLogin?'friends':'friends-o'" />
        <div style="font-size: 12px;">{{isLogin?'用户':'登录'}}</div>
      </van-button>-->
      <van-button :disabled="!mapLoad" class="map-button" @click.stop="showLayer" type="default">
        <i class="iconfont icon-tuceng"></i>
      </van-button>
    </div>
    <div class="button-box button-right-box topHalf">
      <van-button :disabled="isMaxZoom" class="map-button" @click.stop="zoomIn" type="default">
        <i class="iconfont icon-jia"></i>
      </van-button>
      <van-button :disabled="isMinZoom" class="map-button" @click.stop="zoomOut" type="default">
        <i class="iconfont icon-jian"></i>
      </van-button>
      <van-button class="map-button" @click.stop="locate" type="default">
        <i class="iconfont icon-dingwei"></i>
      </van-button>
      <van-button class="map-button" @click.stop="showNavSearch" type="default">
        <i class="iconfont icon-daohang"></i>
      </van-button>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  props: {
    isMaxZoom: Boolean,
    isMinZoom: Boolean
  },
  methods: {
    // 定位
    locate() {
      if (this.userlocation) {
        this.$map.flyTo({
          center: [
            this.userlocation.coords.longitude,
            this.userlocation.coords.latitude
          ]
        });
      } else {
        this.$notify({
          type: "success",
          message: `尚未取得定位信息`
        });
      }
    },
    zoomIn() {
      this.$map.zoomIn();
    },
    zoomOut() {
      this.$map.zoomOut();
    },
    showLayer() {
      this.$router.push("layerlist");
    },
    openUser() {
      if (this.isLogin) {
        this.$router.push("user");
      } else {
        this.$router.push("login");
      }
    },
    showNavSearch() {
      this.$router.push("navsearch");
    }
  },
  computed: {
    ...mapState({
      isLogin: state => state.isLogin,
      userlocation: state => state.userlocation,
      mapLoad: state => state.mapLoad
    })
  }
};
</script>
<style lang="less" scoped>
.button-box {
  position: absolute;
  z-index: 999;
  right: 10px;
  width: 40px;
  border-radius: 5px;
  overflow: hidden;
  background-color: white;
  /*font-size: $fontSize;*/
  border: 1px solid #dcdfe6;
  box-shadow: 2px 2px 2px #505050aa;
  .map-button {
    display: block;
    margin: 0 0 0 0;
    color: #464646;
    border-radius: 0;
    font-size: 16px;
    line-height: 1;
    width: 100%;
    padding: 0px;
    border: 0;
    border-bottom: 1px solid #ccc;
    &.active {
      background-color: #1989fa;
      color: #ffffff;
    }
    &:last-child {
      border-bottom: 0;
    }
  }
}
.button-left-box {
  right: auto;
  left: 10px;
  bottom: 20px;
}
.button-right-box {
  left: auto;
  right: 10px;
}
.topHalf {
  top: 50%;
}
.mt10 {
  margin-top: 10px;
}
.button-top-box {
  top: 65px;
}
.button-bottom-box {
  bottom: 20px;
}
</style>