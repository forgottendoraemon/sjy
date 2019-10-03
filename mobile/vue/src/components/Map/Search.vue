<template>
  <!-- TODO:样式自行修改，要修改内容也是自己改 -->
  <form class="search-box" @submit.prevent="searchResult" action="/">
    <!-- <form method="POST" @submit.prevent="RegisterLogin" ref="userForm"> -->
    <van-search
      v-model="searchValue"
      placeholder="搜索用户数据"
      :show-action="showAction"
      @search="onSearch"
      @cancel="onCancel"
      @focus="onFocus"
      @blur="onBlur"
      @keypress="onSearch"
      class="search"
      background="#f7f7f7"
    />
    <!-- 搜索内容的显示 -->
    <div v-if="isHaveSearchResult" :style="{maxHeight:searchHeight+'px'}" class="search-content">
      <template v-for="(item,index) in searchResult">
        <p class="item" :key="index" @click="findElement(item)">
          <van-row>
            <van-col span="22">{{item.value}}</van-col>
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
export default {
  data() {
    return {
      searchValue: "",
      showAction: false,
      resultList: [],
    }
  },
  computed: {
    searchHeight() {
      return document.body.offsetHeight / 3
    },
    searchResult() {
      return this.resultList.push({
        value: "没有搜索结果",
        features: false,
        type: false
      });
    },
    isHaveSearchResult() {
      return this.showAction && this.searchResult.length !== 0
    }
  },
  methods: {
    onSearch(val) {

    },
    onCancel() {
      this.showAction = false
    },
    onFocus() {
      this.showAction = true
    },
    onBlur() {
      if (!this.searchValue) {
        this.showAction = false
      }
    },
  }
}
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
      padding: 10px 0;
    }
  }
  .colorblue {
    /*color: $blue;*/
  }
}
</style>