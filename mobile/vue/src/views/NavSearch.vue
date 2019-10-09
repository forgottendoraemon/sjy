<template>
  <div class="info-page">
    <div>
      <van-nav-bar title="导航" left-text="返回" left-arrow @click-left="onClickLeft" />
      <van-search placeholder="当前位置" disabled>
        <van-icon slot="left-icon" name="location-o" />
      </van-search>
      <van-search
        v-model="searchValue"
        placeholder="目标位置"
        :show-action="showAction"
        @search="onSearch"
        @cancel="onCancel"
        @focus="onFocus"
        @blur="onBlur"
      />
    </div>
    <div v-if="isHaveSearchResult" class="search-content">
      <template v-for="(item,index) in searchResult">
        <p class="item" :key="index" @click="findElement(item.feature)">
          <van-row>
            <van-col span="22">{{item.name}}</van-col>
            <!-- 搜索内容数的图标 -->
            <van-col span="2">
              <span class="iconfont icon-jiantou1"></span>
            </van-col>
          </van-row>
        </p>
      </template>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import mapdata from "../assets/geojson/mapdata";
import navTarget from "../utils/navTarget";

export default {
  data() {
    return {
      searchValue: "",
      showAction: false,
      resultList: []
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
        for (let p in mapdata) {
          const layerdata = mapdata[p].features;
          const rs = layerdata.filter(
            f => f.properties.name && f.properties.name.indexOf(key) != -1
          );
          Array.prototype.push.apply(resultFeatures, rs);
        }

        if (resultFeatures.length) {
          this.resultList = resultFeatures.map(f => ({
            name: f.properties.name,
            feature: f
          }));
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
    findElement(feature) {
      // 计算几何的中心点坐标
      const geometry = feature.geometry;
      let navTargetLatlng = navTarget(geometry);
      this.$router.push("/");
      this.$store.commit("setNavTargetLatlng", navTargetLatlng);
      this.$store.commit("setNavTargetName", feature.properties.name);
      this.$store.commit("setIsRouting", true);
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

  background-color: #eee;
  .search-content {
    flex-grow: 1;
    padding: 0px 2px;
    font-size: 0.9rem;
    overflow: auto;

    .item {
      background: #fff;
      border: 1px solid #eee;
      border-radius: 3px;
      line-height: 2rem;
      padding-left: 11px;
      margin: 3px 0;
    }
  }
}
</style>