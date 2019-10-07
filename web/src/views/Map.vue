<template ref="map">
  <div class="main">
    <div
      class="container"
      :style="`height: calc(100% - ${tableHeight}px);position:relative`"
      ref="container"
    >
      <div id="map-wrap"></div>
      <div class="map-info">
        <!-- 经纬度信息 -->
        <div v-if="currentPosition.lng" class="lng">
          <span>经度:</span>
          <span>{{currentPosition.lng.toFixed(6)}}</span>
        </div>
        <div v-if="currentPosition.lat" class="lat">
          <span>纬度:</span>
          <span>{{currentPosition.lat.toFixed(6)}}</span>
        </div>
        <!-- 当前缩放等级 -->
        <div v-if="currentZoomNum" class="currentZoom">
          <span>级别:</span>
          <span ref="zoom">{{currentZoomNum | formatZoom }}</span>
        </div>
      </div>
    </div>
    <!-- 侧边栏 -->
    <Aside ref="Aside" />
    <!-- 搜索框 -->
    <Search />
    <!-- 表格视图 -->
    <TableView />
    <!-- <SearchToPlace></SearchToPlace>
    <MarkerTable ref="MarkerTable" />
    <Share></Share>-->
    <!-- 标注的属性框 -->
    <AttrPanel :tableHeight.sync="tableHeight" ref="attrPanel"></AttrPanel>
    <!-- <AddElePanel :tableHeight.sync="tableHeight"></AddElePanel>-->
  </div>
</template>
<script>
import Vue from "vue";
import Search from "@/components/map_components/Search";
import Aside from "@/components/map_components/Aside";
import TableView from "@/components/map_components/TableView";
import AttrPanel from "@/components/map_components/AttrPanel";
// import AddElePanel from "@/components/map_components/labelAttr_components/AddElePanel";
// import SearchToPlace from "@/components/map_components/aside_components/asideleft_component/SearchToPlace";
// import Share from "@/components/user_components/Share";

import { mapState } from "vuex";
import mapstyle from "../mapconfig/style";
import maplayers from "../mapconfig/maplayers";
import locationLayer from "../assets/js/locationLayer";
import cameraLayer from "../assets/js/cameraLayer";

export default {
  data() {
    return {
      progressDialog: {
        // 进度
        open: false,
        msg: "正在请求..."
      },
      settingDialog: {
        // 设置
        open: false,
        isAllowDrag: false,
        isClickToRemove: false
      },
      currentZoomNum: false,
      currentPosition: {
        lat: "",
        lng: ""
      },
      tableHeight: "0"
    };
  },
  filters: {
    formatZoom(val) {
      return parseInt(val);
    }
  },
  methods: {
    // 地图初始化
    initMap() {
      const mymap = new mapboxgl.Map({
        container: "map-wrap",
        style: mapstyle,
        minZoom: 5,
        maxZoom: 18
      });
      mymap.on("load", () => {
        // 处理实时位置图层
        locationLayer(mymap, this.userinfo, maplayers);
        // 摄像头图层
        cameraLayer(mymap, this.userinfo, maplayers);
        this.$store.commit("setLayerList", maplayers);
        // 处理可点击的图层
        maplayers
          .filter(layerconfig => layerconfig.enableClick)
          .forEach(layerconfig => {
            layerconfig.ids.forEach(layerid => {
              // 给可以点击的图层，添加鼠标移入和移出的效果
              mymap.on("mouseenter", layerid, evt => {
                mymap.getCanvasContainer().style.cursor = "pointer";
              });
              mymap.on("mouseleave", layerid, evt => {
                mymap.getCanvasContainer().style.cursor = "";
              });
              // 当点击可点击的图层时，打开被点击的对象的详细属性
              mymap.on("click", layerid, evt => {
                const [feature] = evt.features;
                console.log(feature);
                this.$store.commit("setCurrentSelectLayerInfo", layerconfig);
                this.$store.commit("setCurrentSelectFeature", feature);
              });
            });
          });
      });

      Vue.prototype.$map = mymap;
      window.$map = mymap;
    }
  },
  components: {
    Search,
    Aside,
    TableView,
    // MarkerTable,
    AttrPanel
    // MarkerProps,
    // AddElePanel,
    // SearchToPlace,
    // Share
    // addLayer
  },
  computed: {
    ...mapState({
      //   tileLayers: state => state.mapStatus.tileLayers,
      userinfo: state => state.userinfo // 用户信息
      //   isAsiderOpen: state => state.asider.isAsiderOpen, // 是否打开asider
      //   lastUserName: state => state.user.lastUserName, // 最后登录的用户名
      //   isShowMarkerTable: state => state.mapLayers.isShowMarkerTable, // 表格打开状态
      //   isShowAttr: state => state.mapLabel.isShowAttr, // 标注的属性栏
      //   attrPaneState: state => state.mapLabel.attrPaneState, // 属性面板的状态(展示/编辑/添加)
      //   currentLayerid: state => state.mapLayers.currentLayerid, // 当前选中图层的layerid
      //   tableData: state => state.mapLayers.tableData, // 表格数据
      //   isTableFullScreen: state => state.mapLayers.isTableFullScreen, // 表格是否全屏
      //   isLogin: state => state.user.isLogin //用户是否登录
    })
  },
  mounted() {
    // 初始化地图
    this.initMap();
  },
  watch: {
    isTableFullScreen(val) {
      if (!val && this.isShowMarkerTable) {
        this.freshHeight(true);
      }
    },
    isShowMarkerTable(val) {
      if ((!this.isTableFullScreen && this.isLogin) || !this.isLogin) {
        this.freshHeight(val);
      }
    }
  }
};
</script>
<style scoped lang="scss">
.main {
  width: 100%;
  //   min-width: 760px;
  //   overflow-x: scroll;
  position: absolute;
  overflow: hidden;
  top: 0;
  bottom: 0;
  .container {
    transition: all 0.2s ease;
  }
  .box {
    //   width: 100%;
    //   height: 100%;
    background: #333;
    //   position: absolute;
    //   bottom: 0;
    //   left: 0;
  }
  .map-info {
    position: absolute;
    bottom: 0px;
    left: 165px;
    padding: 0;
    width: 265px;
    z-index: 999;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font: 12px/1.5 "Helvetica Neue", Arial, Helvetica, sans-serif;
    .lat,
    .lng,
    .currentZoom {
      display: inline-block;
      margin-left: 10px;
      text-decoration: none;
    }
  }
}
#map-wrap {
  width: 100%;
  height: 100%;
}
</style>
