<template>
  <div id="app">
    <Header />
    <div class="app-main">
      <transition name="slide-left">
        <keep-alive>
          <!-- 路由切换后，其内容将显示在下面的位置 -->
          <router-view />
        </keep-alive>
      </transition>
    </div>
  </div>
</template>

<script>
import Header from "@/components/Header";
export default {
  components: {
    Header
  }
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
#app{
  height: 100%;
}
.app-main {
  position: relative;
  height: calc(100% - 61px);
  width: 100%;
}
</style>