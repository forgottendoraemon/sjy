<template>
  <div class="info-page">
    <div>
      <van-nav-bar title="发现" left-text="返回" left-arrow @click-left="onClickLeft" />
    </div>
    <div class="content">
      <!-- 搜索框和背景 -->
      <div class="findbg">
        <van-swipe :autoplay="3000" :height="150" :show-indicators="false" :touchable="false" :width="swipewidth">
          <van-swipe-item v-for="(image, index) in backgroundimges" :key="index">
            <van-image width="100%" height="100%" fit="cover" :src="image" />
          </van-swipe-item>
        </van-swipe>
        <van-search
          v-model="searchValue"
          placeholder="关键字搜索"
          :show-action="showAction"
          @search="onSearch"
          @cancel="onCancel"
          @focus="onFocus"
          @blur="onBlur"
        />
      </div>
      <!-- 分类列表 -->
      <div>
        <van-grid>
          <template v-for="(item,index) in findlayers">
            <van-grid-item :text="item.name" :key="index" @click="onClassCkick(item)">
              <i slot="icon" :class="`iconfont ${item.icon}`" />
            </van-grid-item>
          </template>
        </van-grid>
      </div>
      <!-- 结果列表 -->
      <div class="result">
        <template v-for="(item,index) in resultList">
          <van-row :key="index" @click="findElement(item)">
            <van-col span="8" v-if="item.feature">
              <van-image width="100%" fit="cover" :src="item.photo" />
            </van-col>
            <van-col span="16">
              <h5>{{item.name}}</h5>
              <p>{{item.info}}</p>
            </van-col>
          </van-row>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import extdata from "../assets/geojson/extdata.json";
import mapdata from "../assets/geojson/mapdata";
import showFeature from "../utils/showFeature";
/**
 *  配置哪些图层出现在发现页的分类中
 */
const findlayers = [
  { name: "兴趣点", layer: "poi", icon: "icon-jia" },
  { name: "村", layer: "cun", icon: "icon-jia" }
];

const host = location.host
  ? `${location.protocol}//${location.host}`
  : location.href.split("/index.html#/")[0];

export default {
  data() {
    return {
      searchValue: "",
      showAction: false,
      resultList: [],
      findlayers,
      backgroundimges:[
          `${host}/static/images/banner1.jpg`,
          `${host}/static/images/banner2.jpg`
      ],
      swipewidth:document.body.clientWidth
    };
  },
  methods: {
    onClickLeft() {
      this.$router.back();
    },
    onSearch(val) {
      let key = val.trim();
      if (key) {
        const resultFeatures = [];
        for (let p of findlayers) {
          const layerdata = mapdata[p.layer].features;
          const rs = layerdata
            .filter(
              f => f.properties.name && f.properties.name.indexOf(key) != -1
            )
            .map(f => {
              const ext = extdata[p.layer][f.properties.id] || {};
              return {
                name: f.properties.name,
                info: ext.info || "",
                photo: ext.photos
                  ? `${host}/static/photo/${ext.photos.split(";")[0]}`
                  : "",
                feature: f
              };
            });
          Array.prototype.push.apply(resultFeatures, rs);
        }

        if (resultFeatures.length) {
          this.resultList = resultFeatures;
        } else {
          this.resultList = [
            {
              name: "没有搜索结果",
              feature: false
            }
          ];
        }
      }
    },
    onCancel() {
      this.showAction = false;
    },
    onFocus() {
      this.showAction = true;
      if (!this.searchValue) {
        this.resultList = [];
      }
    },
    onBlur() {
      if (!this.searchValue) {
        this.showAction = false;
      }
    },
    onClassCkick(classitem) {
      const layerdata = mapdata[classitem.layer].features;
      const rs = layerdata.map(f => {
        const ext = extdata[classitem.layer][f.properties.id] || {};
        return {
          name: f.properties.name,
          info: ext.info || "",
          photo: ext.photos
            ? `${host}/static/photo/${ext.photos.split(";")[0]}`
            : "",
          feature: f
        };
      });
      if (rs.length) {
        this.resultList = rs;
      } else {
        this.resultList = [
          {
            name: "没有搜索结果",
            feature: false
          }
        ];
      }
    },
    /**
     * 定位到选中的搜索结果
     */
    findElement(e) {
      if (!e || !e.feature) return;
      //回到地图页
      this.$router.push("/");
      this.showAction = false;
      showFeature(e.feature);
    }
  },
  components: {},
  computed: {
    searchResult() {
      return this.resultList;
    },
    isHaveSearchResult() {
      return this.showAction && this.searchResult.length !== 0;
    }
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.info-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .content {
    flex-grow: 1;
    padding: 0px 2px;
    font-size: 0.9rem;
    overflow: auto;
    display: flex;
    flex-direction: column;

    .findbg {

    }
    .result {
      flex-grow: 1;
      height: 0;
      overflow-y: scroll;
    }
  }
}
</style>