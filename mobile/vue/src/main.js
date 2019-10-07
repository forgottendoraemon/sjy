window.Server = "http://127.0.0.1:3000"; // 后台服务器的地址

import Vue from 'vue';
import App from './App.vue';
import './plugins/vant.js';
import router from './router';
import store from './store';
import "./assets/css/icons.css";

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

  // Android处理返回键
  plus.key.addEventListener('backbutton', function () {
    ('iOS' == plus.os.name) ? plus.nativeUI.confirm('确认退出？', function (e) {
      if (e.index > 0) {
        plus.runtime.quit();
      }
    }, '退出程序', ['取消', '确定']) : (confirm('确认退出？') && plus.runtime.quit());
  }, false);
}





