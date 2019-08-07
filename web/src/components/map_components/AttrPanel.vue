<template>
  <div>
    <transition name="slide-up">
      <div
        v-if="currentSelectFeature"
        class="attr"
        :style="`height:${getHeight};max-height:${getHeight};`"
      >
        <div class="header">
          <div class="title">
            <span style="font-weight: 400;">{{currentSelectLayerInfo.name}}</span>
          </div>
          <span class="close" @click="close">
            <i class="el-icon-close" style="font-size:21px"></i>
          </span>
        </div>
        <div class="content" style="padding:10px 0 50px 10px;">
          <el-scrollbar
            wrap-class="el-select-dropdown_wrap"
            view-class="el-select-dropdown--list"
            style="height: 100%;"
          >
            <template>
              <div v-for="(item, index) in currentSelectLayerInfo.fields" :key="index">
                <div class="item" v-if="item.name">
                  <div class="label">
                    <i class="iconfont icon-T"></i>
                    {{item.display}}
                  </div>
                  <div class="text">
                    <div class="text-desc">{{currentSelectFeature.properties[item.name]}}</div>
                  </div>
                </div>
                <div class="image-item" v-else-if="item.photo">
                  <div class="label">
                    <i class="iconfont icon-tupian"></i>
                    照片
                  </div>
                  <div class="albumn">
                    <el-row>
                      <el-col :span="24" v-if="!item.photo(currentSelectFeature.properties).length">
                        <div style="text-align:center;">
                          <span class="no-photo">暂无照片</span>
                        </div>
                      </el-col>
                      <template>
                        <el-col
                          :span="11"
                          :push="1"
                          class="albumn-item"
                          v-for="(imgItem,imgIndex) in item.photo(currentSelectFeature.properties)"
                          :key="imgIndex"
                        >
                          <div
                            class="zoomImage"
                            @click="openViewer(item.photo(currentSelectFeature.properties),imgIndex)"
                            :style="`background-image:url(${imgItem+'.thumb.jpg'})`"
                          ></div>
                        </el-col>
                      </template>
                    </el-row>
                  </div>
                </div>
              </div>
            </template>
          </el-scrollbar>
        </div>
      </div>
    </transition>
    <ImageViewer
      :isViewerOpen.sync="isViewerOpen"
      :currentIndex.sync="currentIndex"
      :imageList.sync="imageList"
    ></ImageViewer>
  </div>
</template>
<script>
import { mapState } from "vuex";
import ImageViewer from "./ImageViewer";
import axios from "axios";

export default {
  props: {
    tableHeight: String
  },
  components: {
    ImageViewer
  },
  data() {
    return {
      isViewerOpen: false, // 图片查看器状态
      imageList: [],
      currentIndex: 0,
      isClose: false // 是否点击关闭按钮
    };
  },
  computed: {
    ...mapState({
      currentSelectFeature: state => state.currentSelectFeature,
      currentSelectLayerInfo: state => state.currentSelectLayerInfo
    }),
    getHeight() {
      if (this.tableHeight === "0") {
        return `calc(100% - 80px)`;
      } else {
        return `calc(100% - ${this.tableHeight}px - 80px)`;
      }
    }
  },

  methods: {
    // 关闭属性面板
    close() {
      this.$store.commit("setCurrentSelectFeature",null);
    },
    openViewer(imageList, $index, prop) {
      this.currentIndex = $index;
      this.imageList = imageList;
      this.isViewerOpen = true;
    },
    // 未保存退出时恢复原状
    restore() {
    }
  }
};
</script>
<style scoped lang="scss" >
.attr {
  position: absolute;
  left: 10px;
  top: 50px;
  width: 320px;
  z-index: 999;
  background-color: #ffffff;
  box-shadow: 0px 1px 1px 1px #e2e2e2;
  border-radius: 2px;
  transition: all 0.2s ease-in;
  .header {
    position: relative;
    border-bottom: 1px solid #dcdfe6;
    background: #3385ff;
    // margin-bottom: 10px;
    padding: 7px 10px;
    color: #fff;
    .title {
      display: inline-block;
    }
    .edit,
    .close {
      float: right;
      cursor: pointer;
      font-size: 20px;
    }
  }
  .edit-tool {
    padding: 5px;
    padding-bottom: 0;
    text-align: center;
    .icon {
      padding: 5px;
      font-size: 16px;
    }
  }
  .content {
    // padding: 10px 0 50px 10px;
    overflow: hidden;
    height: calc(100% - 60px);
    .item {
      border-bottom: 1px solid #e2e2e2;
      padding: 5px;
      margin-bottom: 9px;
      position: relative;
      .label {
        display: inline-block;
        width: 25%;
        color: #999;
        position: relative;
        vertical-align: top;
      }
      .text {
        display: inline-block;
        width: 70%;
        color: #000;
        &:before {
          content: "";
          display: block;
          width: 1px;
          height: 100%;
          background: #e2e2e2;
          position: absolute;
          margin-left: -5px;
          margin-top: -3px;
          top: 0;
        }
        .text-desc {
          padding-left: 15px;
          color: #606266;
        }
        .lat,
        .lng {
          display: inline-block;
          width: 48%;
          padding-left: 15px;
        }

        .edit-input {
          margin-left: 10px;
          text-indent: 0;
          /deep/ .el-textarea__inner {
            font-family: "Helvetica Neue", Helvetica, "PingFang SC",
              "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial,
              sans-serif;
          }
          /deep/ .el-input__suffix {
            line-height: 32px;
            cursor: pointer;
          }
        }
      }
      // .over-length {
      //   // text-indent: 2em;
      // }
      .center {
        text-align: center;
      }
    }
    .image-item {
      border-bottom: 1px solid #e2e2e2;
      padding: 5px;
      margin-bottom: 9px;
      position: relative;
      .label {
        padding-bottom: 5px;
        color: #999;
        position: relative;
        .preview {
          position: absolute;
          right: 0;
          top: 0;
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
      }
      .albumn {
        padding: 10px 0 5px 0;
        // cursor: zoom-in;
        .no-photo {
          color: #909399;
          font-size: 12px;
        }
        .albumn-item {
          position: relative;
          border: 1px solid #e2e2e2;
          line-height: 67px;
          text-align: center;
          overflow: hidden;
          margin-bottom: 5px;
          margin-right: 5px;
          cursor: zoom-in;
          .zoomImage {
            width: 100%;
            height: 0;
            padding-bottom: 100%;
            overflow: hidden;
            background-position: center center;
            background-repeat: no-repeat;
            // 保持原有比例
            background-size: contain;
          }
          &:hover {
            padding: 2px;
            .delete-btn {
              display: block;
              position: absolute;
              right: 2px;
              top: 2px;
              width: 40px;
              height: 20px;
              cursor: pointer;
              color: #e43427;
              i {
                position: absolute;
                font-size: 18px;
                transition: transform 0.2s ease-out;
                &:hover {
                  // font-size: 20px;
                  transform: rotate(90deg);
                }
              }
            }
          }
          .delete-btn {
            display: none;
          }
        }
        span,
        img {
          width: 100%;
          height: 100%;
        }
        .albumn-upload {
          border: 1px solid #e2e2e2;
          // line-height: 67px;
          text-align: center;
          overflow: hidden;
          .upload {
            position: relative;
            font-size: 12px;
            overflow: hidden;
            background: #f0f0f0;
            height: 131px;
            line-height: 131px;
            cursor: pointer;
          }
        }
      }
    }
    /deep/ .el-scrollbar__bar {
      bottom: -8px;
      // right: -8px;
    }
    /deep/ .el-select-dropdown--list {
      padding-bottom: 8px;
      padding-right: 10px;
    }
    /deep/ .el-select-dropdown_wrap {
      overflow-x: hidden;
    }
    /deep/ .el-scrollbar__thumb {
      background-color: rgba(106, 107, 109, 0.3);
    }
    .save-button {
      text-align: center;
      position: absolute;
      width: 95%;
      bottom: 5px;
    }
  }
  .active {
    color: #3a8ee6;
    border-color: #3a8ee6;
    outline: 0;
    background-color: #ecf5ff;
  }
}
</style>

