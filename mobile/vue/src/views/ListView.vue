<template>
  <div class="info-page">
    <van-nav-bar
      :title="listViewLayerItem.name"
      left-text="地图"
      left-arrow
      @click-left="onClickLeft"
    />
    <div class="content">
      <template v-for="(item,index) in features">
        <div class="item" :key="index">
          <van-cell :title="item.properties.name" @click="showFeature(item)">
            <van-icon slot="right-icon" name="location-o" style="line-height: inherit;" />
          </van-cell>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import mapdata from "../assets/geojson/mapdata";
import showFeature from "../utils/showFeature";

export default {
  methods: {
    onClickLeft() {
      this.$router.replace("/");
    },
    showFeature(e) {
      //回到地图页
      this.$router.replace("/");
      // 将选中的要素显示在地图上
      showFeature(e);
    }
  },
  components: {},
  computed: {
    ...mapState({
      listViewLayerItem: state => state.listViewLayerItem
    }),
    features() {
      const { features } = mapdata[this.listViewLayerItem.source];
      return features.filter(
        f => f.properties.name && f.properties.name.trim()
      );
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
    overflow: auto;
  }
}
</style>