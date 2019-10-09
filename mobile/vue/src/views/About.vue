<template>
  <div class="info-page">
    <div>
      <van-nav-bar title="关于" left-text="返回" left-arrow @click-left="onClickLeft" />
    </div>
    <div class="content">
      <!-- 正文 -->
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";

export default {
  data() {
    return {};
  },
  methods: {
    onClickLeft() {
      this.$router.back();
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
    padding: 0px 2px;
    font-size: 0.9rem;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }
}
</style>