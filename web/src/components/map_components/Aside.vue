<template>
  <div>
    <aside class="asider" :class="isAsiderOpen ? 'active' : ''">
      <LayerLists/>
      <AsiderLeft/>
    </aside>
  </div>
</template>

<script>
import AsiderLeft from "@/components/map_components/aside_components/AsiderLeft";
import LayerLists from "@/components/map_components/aside_components/LayerLists";
// import ShareLayerLists from "@/components/map_components/aside_components/shareLayerLists";

import { mapState, mapMutations } from "vuex";

export default {
  computed: {
    ...mapState({
      isAsiderOpen: state => state.isAsiderOpen, // 是否打开asider
      // currentTabIndex: state => state.asider.currentTabIndex, // 当前打开的asider tab index
      // isLogin: state => state.user.isLogin, // 用户是否登陆
      // shareDialogVisible: state => state.dialogForm.shareDialogVisible // 是否显示分享界面
    })
  },
  components: {
    AsiderLeft,
    LayerLists,
    // ShareLayerLists
  }
};
</script>

<style scoped lang="scss">
.asider {
  width: 220px;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  transition: 0.3s;
  transform: translateX(220px);
  background: #fff;
  z-index: 999;
  &.active {
    transform: translateX(0);
  }
}
</style>
