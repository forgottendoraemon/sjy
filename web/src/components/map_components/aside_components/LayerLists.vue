<template>
  <div class="layerBox">
    <!-- 头部 操作按钮组 -->
    <div class="clearfix icon-list">图层列表</div>
    <!-- 图层列表 -->
    <div class="layerLists">
      <el-scrollbar
        wrap-class="el-select-dropdown_wrap"
        view-class="el-select-dropdown--list"
        style="height: 100%;"
      >
        <template v-for="(item, index) in LayersList">
          <div
            :class="['layer', item.visible? '': 'layer_disable']"
            :key="index"
          >
            <el-row :gutter="24" class="title_box">
              <!-- 显示/隐藏 图层 -->
              <el-col :span="2" class="title_eye">
                <el-tooltip :content="item.visible? '隐藏': '显示'" placement="top">
                  <i
                    :class="['iconfont', item.visible ? 'icon-browse' : 'icon-guanbi-yanjing']"
                    @click="layerShowToggle(item, index)"
                  ></i>
                </el-tooltip>
              </el-col>
              <!-- 列表 标题 -->
              <el-col :span="15">
                <span class="title_text">{{item.name}}</span>
              </el-col>
              <!-- 查看表格 -->
              <el-col :span="4" style="padding-right:0">
                <a @click="openLayerTable(index, item.id)" class="grid-content openLayerTable">
                  <i class="iconfont icon-biaoge font-fcolor-409ef"></i>
                </a>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  components: {},
  data() {
    return {
      activeIndex: 0
    };
  },
  computed: {
    ...mapState({
      LayersList: state => state.LayersList // 图层列表数据(全局)
    })
  },
  created() {},

  methods: {
    layerShowToggle(item, index) {
      for(let layerid of item.ids){
          if (item.visible) {
            this.$map.setLayoutProperty(layerid, "visibility", "none");
          } else {
            this.$map.setLayoutProperty(layerid, "visibility", "visible");
          }
      }
      item.visible = !item.visible;
    },
    openLayerTable(item) {}
  },

  mounted() {}
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/color.scss";

//新建图层
.icon-list {
  padding: 5px 10px;
  background-color: #eeeeee;
  box-shadow: 0px 1px 1px 1px #e2e2e2;
  .icon {
    padding: 5px;
    font-size: 16px;
  }
}
.layerLists {
  position: absolute;
  top: 40px;
  bottom: 0;
  width: 100%;
  height: calc(100% - 40px);
  padding: 0 10px;
  padding-right: 0;
  .layer_disable {
    opacity: 0.5;
  }
  .layer_disable::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
  }
  .layer_active {
    border: 2px solid #409eff !important;
  }
  .layer {
    width: 100;
    height: 100%;
    padding: 5px 10px;
    margin: 10px 0;
    background: #fff;
    position: relative;
    border: 2px solid #dadada;
    border-radius: 3px;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.3);
    .title_box {
      font-size: 16px;
      .title_eye {
        position: relative;
        z-index: 3;
        .iconfont {
          cursor: pointer;
        }
      }
      .title_text {
        max-width: 150px;
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .font-fcolor-409ef {
      color: #409eff;
    }
    .font-fcolor-9e9e9e {
      color: #9e9e9e;
    }
    .openLayerTable {
      cursor: pointer;
      vertical-align: middle;
      &:hover {
        color: red;
      }
    }
  }
  /deep/ .el-scrollbar__bar {
    right: 2px;
  }
  /deep/ .el-scrollbar__wrap {
    padding-right: 10px;
    overflow-x: hidden;
  }
  /deep/ .is-horizontal {
    display: none;
  }
  /deep/ .el-scrollbar__thumb {
    background-color: rgba(106, 107, 109, 0.3);
  }
}
.layerBox {
  position: relative;
  height: 100%;
  overflow-x: hidden;
  .tool-bar {
    position: fixed;
    left: -300px;
    top: 10px;
    font-size: 0;
    button {
      margin: 0;
      font-size: 15px;
      padding: 10px;
      border-radius: 0;
      box-shadow: 3px 3px 2px #505050aa;
    }
  }
}
.rename-button,
.addEle-button {
  cursor: pointer;
}
</style>
<style>
.el-select-dropdown_wrap {
  overflow-x: hidden;
}
.my-div-icon {
  font-size: 14px;
}

.marker-label {
  position: absolute;
  width: 92px;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px;
  border-radius: 5px;
  color: #fff;
  top: 50%;
  transform: translateY(-50%);
}
.el-popover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
  padding: 10px;
}
</style>
