window.Server = "http://192.168.43.200:3000"; // 后台服务器的地址

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

const debug = false;

if (debug) {
  main(); // 浏览器测试
}
else {
  document.addEventListener("plusready", main); // app打包
}





