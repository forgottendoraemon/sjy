<template>
  <div id="app">
    <transition :name="transitionName">
      <keep-alive>
        <router-view />
      </keep-alive>
    </transition>
    <Warning />
    <LocationSend />
  </div>
</template>

<script>
import Warning from "./components/Warning";
import LocationSend from "./components/LocationSend";

export default {
  name: "app",
  data() {
    return {
      transitionName: ""
    };
  },
  components: {
    Warning,
    LocationSend
  },
  watch: {
    $route(to, from) {
      //  监听路由变化时的状态为前进还是后退
      let isBack = to.name == "map";
      if (isBack) {
        this.transitionName = "slide-right";
      } else {
        this.transitionName = "slide-left";
      }
    }
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
.slide-left-enter,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-leave-to,
.slide-right-enter {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: 0.3s;
  position: absolute;
  top: 0;
}
</style>

