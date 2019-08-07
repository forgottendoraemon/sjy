<template>
  <el-dialog
    class="viewer-dialog"
    :title="imageList[currentIndex]?imageList[currentIndex].name:''"
    :fullscreen="true"
    :visible.sync="isViewerOpen"
    append-to-body
    :close-on-click-modal="false"
    :center="true"
    :show-close="true"
    :before-close="closeViewer"
    :modal="false"
  >
    <div class="viewer-content">
      <span class="prev-btn btn" @click="prev">
        <i class="el-icon-arrow-left"></i>
      </span>
      <span class="next-btn btn" @click="next">
        <i class="el-icon-arrow-right"></i>
      </span>
      <img :src="imgUrl" alt @click="closeViewer" @load="handleLoad" class="image">
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "ImageViewer",
  props: {
    isViewerOpen: Boolean,
    currentIndex: Number,
    imageList: Array
  },
  data() {
    return {
      loadingInstance: null
    };
  },
  computed: {
    imgUrl() {
      return this.imageList[this.currentIndex] && this.isViewerOpen
        ? this.imageList[this.currentIndex]
        : "";
    }
  },
  methods: {
    // 上一张图
    prev() {
      let index =
        this.currentIndex - 1 < 0
          ? this.imageList.length - 1
          : this.currentIndex - 1;
      this.$emit("update:currentIndex", index);
    },
    // 下一张图
    next() {
      let index =
        this.currentIndex + 1 > this.imageList.length - 1
          ? 0
          : this.currentIndex + 1;
      this.$emit("update:currentIndex", index);
    },
    closeViewer() {
      this.$emit("update:isViewerOpen", false);
      this.handleLoad();
    },
    handleLoad() {
      this.loadingInstance && this.loadingInstance.close();
    }
  },
  watch: {
    isViewerOpen(val) {
      if (val) {
        this.loadingInstance = this.$loading({
          background: "rgba(0, 0, 0, 0)",
          target: ".viewer-dialog"
        });
      }
    }
  }
};
</script>

<style lang='scss' scoped>
.viewer-dialog {
  /deep/ .el-dialog {
    background: rgba(0, 0, 0, 0.8);
    position: relative;
  }
  >>> .el-dialog__header {
    height: 5%;
  }
  >>> .el-dialog__title {
    color: #fff;
  }
  >>> .el-dialog__headerbtn {
    font-size: 40px;
    z-index: 2001;
  }
  >>> .el-dialog__body {
    height: 95%;
  }
  .viewer-content {
    text-align: center;
    height: 100%;
    .btn {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      font-size: 48px;
      background: #9e9e9e54;
      border-radius: 100%;
      width: 64px;
      height: 64px;
      color: #cccaca;
      cursor: pointer;
      transition: all 0.3s;
      &:hover {
        width: 80px;
        height: 80px;
        font-size: 64px;
      }
    }
    .prev-btn {
      left: 25px;
    }
    .next-btn {
      right: 25px;
    }
    img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
      transition: all 0.2s;
      cursor: zoom-out;
      max-width: 80%;
      max-height: 80%;
    }
  }
}
</style>