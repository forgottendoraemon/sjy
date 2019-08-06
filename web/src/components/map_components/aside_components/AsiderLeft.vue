<template>
  <div class="asider-sub">
    <!-- 地图放大按钮 -->
    <el-tooltip content="放大" effect="dark" placement="left">
      <el-button @click="zoomIn" icon="el-icon-plus" circle :disabled="isMaxZoom"></el-button>
    </el-tooltip>
    <!-- 地图缩小按钮 -->
    <el-tooltip content="缩小" effect="dark" placement="left">
      <el-button @click="zoomOut" icon="el-icon-minus" circle :disabled="isMinZoom"></el-button>
    </el-tooltip>
    
    <div class="mt10">
        <!-- 展开/收起 图层列表 -->
        <el-tooltip content="图层列表" effect="dark" placement="left">
          <el-button
            :class="isAsiderOpen? 'active' : ''"
            @click="openAside"
            :type="isAsiderOpen ? 'primary' : ''"
            class="iconfont icon-tucengliebiao"
            circle
          ></el-button>
        </el-tooltip>
      </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      isMinZoom: false /* 是否为最小zoom */,
      isMaxZoom: false /* 是否为最大zoom */
    };
  },

  methods: {
    zoomIn() {
      this.$map.zoomIn();
      if (this.$map.getZoom() >= this.$map.getMaxZoom()) {
        this.isMaxZoom = true;
      } else {
        this.isMaxZoom = false;
        this.isMinZoom = false;
      }
    },
    zoomOut() {
      if (this.$map.getZoom() === this.$map.getMinZoom()) {
        this.isMinZoom = true;
        return;
      } else {
        this.isMaxZoom = false;
        this.isMinZoom = false;

        this.$map.zoomOut();
      }
    },

    openAside() {
      this.$store.commit('toggleAsiderOpen');
    },
  },
  computed: {
    ...mapState({
      isAsiderOpen: state => state.isAsiderOpen,
    })
  }
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/color.scss";

.asider-sub {
  position: absolute;
  top: 0;
  left: -46px;
  padding: 10px 10px 0 0;
  z-index: 900;
  .el-button.is-circle {
    display: block;
    margin: 0 0 0 0;
    padding: 10px;
    color: #464646;
    border-radius: 0;
    font-size: 16px;
    box-shadow: 2px 2px 2px #505050aa;
    &.active {
      color: #fff;
    }
  }
}

.mt10 {
  margin-top: 10px;
}

.layerToggleBtn {
  width: 38px;
  position: relative;
}

.select-box {
  width: 100%;
  padding: 20px 10px; // min-height: 100px;
  margin-top: 2px;
  background: #fff;
  font-size: 14px;
  h3 {
    text-align: left;
  }
  p {
    line-height: 32px;
    .label {
      float: left;
      width: 50px;
    }
    .el-select {
      width: 190px;
      float: left;
    }
  }
}
// .searchToPlac-box {
//   position: absolute;
//   top: 168px;
//   left: -333px;
//   border-radius: 2px;
//   padding: 8px;
//   border: 1px solid #dcdfe6;
//   background-color: white;
//   -webkit-box-shadow: 0px 1px 1px 1px #cdcbc6;
//   box-shadow: 0px 1px 1px 1px #cdcbc6;
//   .latlng-input {
//     width: 125px;
//   }
//   .latlngsearch-ok {
//     background-color: #409eff;
//     color: white;
//     border-top-left-radius: 0;
//     border-bottom-left-radius: 0;
//     &:focus,
//     &:hover {
//       background: #66b1ff;
//       border-color: #66b1ff;
//       color: #fff;
//     }
//     &:active {
//       background: #3a8ee6;
//       border-color: #3a8ee6;
//       color: #fff;
//     }
//   }
// }
</style>