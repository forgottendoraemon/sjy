<template>
  <div id="app">
    <div class="body">
      <transition :name="transitionName">
        <keep-alive>
          <router-view />
        </keep-alive>
      </transition>
    </div>
    <Warning />
    <LocationSend />
    <van-tabbar route v-if="showTabMenu">
      <van-tabbar-item replace to="/" icon="home-o">地图</van-tabbar-item>
      <van-tabbar-item replace to="/find">
        <span>发现</span>
        <i
          slot="icon"
          slot-scope="props"
          class="iconfont icon-faxian"
          :style="{color:props.active?'#1989fa':''}"
        />
      </van-tabbar-item>
      <van-tabbar-item replace to="/my">
        <span>我的</span>
        <i
          slot="icon"
          slot-scope="props"
          class="iconfont icon-wo"
          :style="{color:props.active?'#1989fa':''}"
        />
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import Warning from "./components/Warning";
import LocationSend from "./components/LocationSend";

export default {
  name: "app",
  data() {
    return {
      transitionName: "",
      showTabMenu: true
    };
  },
  components: {
    Warning,
    LocationSend
  },
  computed: {},
  watch: {
    $route(to, from) {
      //  监听路由变化时的状态为前进还是后退
      let isBack = to.name == "map";
      if (isBack) {
        this.transitionName = "slide-right";
      } else {
        this.transitionName = "slide-left";
      }

      const showrs = ["map", "my", "find"];
      this.showTabMenu = !!showrs.find(r => to.name == r);
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
  display: flex;
  flex-direction: column;
}

#app .body {
  flex-grow: 1;
}

#app .van-tabbar--fixed {
  position: relative;
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

