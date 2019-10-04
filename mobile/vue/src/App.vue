<template>
  <div id="app">
    <!-- TODO: -->
    <transition name="slide-left">
      <keep-alive>
        <!--请设置 路由切换后，其内容将显示在下面的位置 -->
        <router-view />
      </keep-alive>
    </transition>
    <Warning />
  </div>
</template>

<script>
import Warning from "./components/Warning";

export default {
  name: "app",
  components: {
    Warning
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
#app {
  height: 100%;
}
</style>

