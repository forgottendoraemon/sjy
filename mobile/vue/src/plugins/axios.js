"use strict";

import Vue from 'vue';
import axios from "axios";
import plusAxios from "@/assets/js/plus.axios";

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
  // baseURL: process.env.baseURL || process.env.apiUrl || ""
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
};


let _axios = axios.create(config);

_axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    //在发出请求前做点什么
    return config;
  },
  function (error) {
    // Do something with request error
    // 在发出 处理请求错误 统一处理错误
    return Promise.reject(error);
  }
);


// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    //处理响应数据
    return response;
  },
  function (error) {
    // Do something with response error
    // 处理响应错误 统一处理错误
    console.log(`错误:${error}`);
    return Promise.reject(error);
  }
);
//
//TODO: 请求请使用Vue.axios;来请求
Plugin.install = function (Vue, options) {
  if (window.plus) {
    _axios = plusAxios;
  }
  Vue.axios = _axios;
  window.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    },
  });
};

Vue.use(Plugin)

export default Plugin;
