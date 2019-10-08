window.Server = "http://127.0.0.1:3000"; // 后台服务器的地址

import Vue from 'vue';
import App from './App.vue';
import './plugins/vant.js';
import router from './router';
import store from './store';
import "./assets/css/iconfont.css";

function main() {
  require("./plugins/axios");
  Vue.config.productionTip = false
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
}

const debug = true;

if (debug) {
  main(); // 浏览器测试
}
else {
  document.addEventListener("plusready", main); // app打包

  // 返回键处理
  plus.key.addEventListener('backbutton', function () {
    if (router.currentRoute.name == "map") {
      // 如果在地图页按下返回，提示用户是否要退出程序
      if ('iOS' == plus.os.name) {
        plus.nativeUI.confirm('确认退出？', function (e) {
          if (e.index > 0) {
            plus.runtime.quit();
          }
        }, '退出程序', ['取消', '确定'])
      }
      else {
        (confirm('确认退出？') && plus.runtime.quit());
      }
    }
    else {
      // 返回地图页
      router.replace('/map');
    }
  }, false);
}





