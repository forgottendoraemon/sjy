<template>
  <div>
    <!-- 用户 -->
    <div class="button-box button-top-box">
      <van-button class="map-button" @click.stop="openUser" type="default">
        <van-icon :name="isLogin?'friends':'friends-o'" />
        <div style="font-size: 12px;">{{isLogin?'用户':'登录'}}</div>
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
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  props: {
    isMaxZoom: Boolean,
    isMinZoom: Boolean
  },
  methods: {
    // 定位
    locate() {
      //判断是否是app环境 plus打包外壳添加的
      console.log(11)
      if (window.plus) {
        const plus = window.plus;
        /**
         * API参考:
         * https://www.html5plus.org/doc/zh_cn/geolocation.html;
         * TODO:position 根据返回的数据进行定位 
         * 注意:要根据返回的数据坐标类型转换等前地图的坐标
         */
        plus.geolocation.getCurrentPosition((position) => {
          this.$notify({
            type: 'success',
            message: JSON.stringify(position)
          })
        }, (a) => {

        }, {
          enableHighAccuracy: true,
          coordsType: "wgs84",
          geocode: true
        })
      }
    },
    zoomIn() {
      this.$map.zoomIn()
    },
    zoomOut() {
      this.$map.zoomOut()
    },
    openUser() {
      if (this.isLogin) {
        this.$router.replace("user")
      } else {
        this.$router.replace("login")
      }

    },

  },
  computed: {
    ...mapState({
      isLogin: state => state.isLogin
    })
  }
}
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