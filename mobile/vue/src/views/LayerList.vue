<template>
  <div class="info-page">
    <van-nav-bar title="图层列表" left-text="地图" left-arrow @click-left="onClickLeft" />
    <div class="content">
      <template v-for="(item,index) in layerList">
        <div class="item" :key="index">
          <van-row type="flex" align="center">
            <van-col span="1"></van-col>
            <van-col span="3">
              <van-switch @change="changeVisbile(item)" v-model="item.visible" size="16px" />
            </van-col>
            <van-col span="20" v-if="item.enableTable">
              <van-cell :title="item.name" is-link value="内容" @click="showLayerData(item)" />
            </van-col>
            <van-col span="20" v-if="!item.enableTable">
              <van-cell :title="item.name" />
            </van-col>
          </van-row>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import maplayers from "../mapconfig/maplayers";

export default {
  data() {
    return {
      layerList: maplayers
    };
  },
  methods: {
    onClickLeft() {
      this.$router.replace("/");
    },
    showLayerData(layerItem) {
      this.$store.commit("setListViewLayerItem", layerItem);
      this.$router.replace("listview");
    },
    changeVisbile(layerItem) {
      for (let layerid of layerItem.ids) {
        if (layerItem.visible) {
          this.$map.setLayoutProperty(layerid, "visibility", "visible");
        } else {
          this.$map.setLayoutProperty(layerid, "visibility", "none");
        }
      }
    }
  },
  components: {},
  computed: {},
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
    overflow: auto;
  }
}
</style>