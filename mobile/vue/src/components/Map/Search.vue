<template>
  <!-- TODO:样式自行修改，要修改内容也是自己改 -->
  <form class="search-box" @submit.prevent="searchResult" action="/">
    <!-- <form method="POST" @submit.prevent="RegisterLogin" ref="userForm"> -->
    <van-search
      v-model="searchValue"
      placeholder="输入关键字搜索"
      :show-action="showAction"
      @search="onSearch"
      @cancel="onCancel"
      @focus="onFocus"
      @blur="onBlur"
      class="search"
      background="#f7f7f7"
    />
    <!-- 搜索内容的显示 -->
    <div v-if="isHaveSearchResult" :style="{maxHeight:searchHeight+'px'}" class="search-content">
      <template v-for="(item,index) in searchResult">
        <p class="item" :key="index" @click="findElement(item.feature)">
          <van-row>
            <van-col span="22">{{item.name}}</van-col>
            <!-- 搜索内容数的图标 -->
            <van-col span="2">
              <span class="iconfont colorblue"></span>
            </van-col>
          </van-row>
        </p>
      </template>
      <!-- <p style="color:#ccc" v-if="searchResult.length==0">无</p> -->
    </div>
  </form>
</template>
<script>
import mapdata from "../../assets/geojson/mapdata";
import showFeature from "../../utils/showFeature";

export default {
  data() {
    return {
      searchValue: "",
      showAction: false,
      resultList: []
    };
  },
  computed: {
    searchHeight() {
      return document.body.offsetHeight / 3;
    },
    searchResult() {
      return this.resultList;
    },
    isHaveSearchResult() {
      return this.showAction && this.searchResult.length !== 0;
    }
  },
  methods: {
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
    /**
     * 定位到选中的搜索结果
     */
    findElement(e) {
      if (!e) return;
      this.showAction = false;
      showFeature(e);
    }
  }
};
</script>
<style lang="less" scoped>
.search-box {
  z-index: 1000;
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;

  .search {
    border-radius: 3px;
  }
  .search-content {
    width: 100%;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    background-color: rgba(255, 255, 255, 0.9);
    overflow: auto;
    padding: 10px 20px;
    /deel/.van-search__content {
      background-color: #ffffff;
    }
    .item {
      border-bottom: 1px solid #ededed;
      color: #535353;
      /*padding: 10px 0;*/
    }
  }
  .colorblue {
    color: blue;
  }
}
</style>