import Vue from 'vue';
import App from './App.vue';
import './plugins/vant.js';
import router from './router';
import store from './store';
import "./assets/css/icons.css";

//确保window.plus 加载后加载
//TODO:消息通知请参考 https://www.html5plus.org/doc/zh_cn/push.html
// document.addEventListener("plusready", () => {
  require("./plugins/axios");
  Vue.config.productionTip = false
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
// })



