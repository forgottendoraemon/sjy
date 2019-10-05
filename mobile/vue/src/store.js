import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// const host = location.host ? `${location.protocol}//${location.host}` : location.href.split("/index.html#/")[0];

export default new Vuex.Store({
  state: {
    userinfo: null,
    isLogin: false,//是否登录

    /**
     * 用户当前位置
     * coords: {
            latitude: number,
            longitude: number
          },
          timestamp: number
     */
    userlocation: null,
    // 当前选中的景点信息 {feature:any,ext:{info,photo,audio}}
    selectScenicSpot: null,
    /**
     * 导航的终点坐标
     * [lng,lat]
     */
    navTargetLatlng: null,
    /**
     * 导航目标的名称描述
     */
    navTargetName:null,
    /**
     * 是否启动导航
     */
    isRouting:false
  },
  mutations: {
    setUserInfo(state, newvalue) {
      console.log(`setUserInfo = ${newvalue}`);
      if (state.userinfo !== newvalue) {
        if (newvalue) {
          state.isLogin = true;
        }
        else {
          state.isLogin = false;
        }
        state.userinfo = newvalue;
      }
    },

    setUserlocation(state, newvalue) {
      if (state.userlocation !== newvalue) {
        state.userlocation = newvalue;
      }
    },

    setSelectScenicSpot(state, newvalue) {
      if (state.selectScenicSpot !== newvalue) {
        state.selectScenicSpot = newvalue;
      }
    },

    setNavTargetLatlng(state, newvalue) {
      if (state.navTargetLatlng !== newvalue) {
        state.navTargetLatlng = newvalue;
      }
    },

    setNavTargetName(state, newvalue) {
      if (state.navTargetName !== newvalue) {
        state.navTargetName = newvalue;
      }
    },

    setIsRouting(state, newvalue) {
      if (state.isRouting !== newvalue) {
        state.isRouting = newvalue;
      }
    },
  },
  actions: {
    /**
     * 从服务器获取用户信息
     */
    async updateUserInfo({ commit, state }) {
      try {
        const result = await Vue.axios.get(`/user/user`);
        commit('setUserInfo', result.data);
        // commit('setUserInfo', data);
      } catch (error) {
        commit('setUserInfo', null);
      }
    },
    /**
     * 
     * @param {*} param0 
     * @param {*} data 
     */
    async login({ commit, state }, data) {
      try {
        const result = await Vue.axios.post(`/user/login`, data);
        console.log(result)
        commit('setUserInfo', result.data);
        // commit('setUserInfo', data);
        return result
      } catch (error) {
        commit('setUserInfo', null);
        return error
      }
    },
    /**
    * 退出并更新用户信息
    */
    async logout({ commit, state }) {
      try {
        await Vue.axios.get(`/user/logout`);
        commit('setUserInfo', null);
      } catch (error) {
        commit('setUserInfo', null);
      }
    },

    /**
     * 启动用户位置自动更新
     */
    async startWatchLocation({ commit, state }) {
      if (window.plus) {
        // 手机设备真实位置
        const plus = window.plus;
        plus.geolocation.getCurrentPosition(position => {
          commit("setUserlocation", position);
        });
        plus.geolocation.watchPosition(position => {
          commit("setUserlocation", position);
        });
      }
      else {
        // 浏览器模拟位置
        const defaultPostiton = {
          coords: {
            latitude: 34.64370896168853,
            longitude: 98.04180297572702
          },
          timestamp: new Date().getTime()
        }
        commit("setUserlocation", defaultPostiton);
        const update = () => {
          const d = 0.01;
          const p = {
            coords: {
              latitude: 34.64370896168853 + Math.random() * d - d / 2,
              longitude: 98.04180297572702 + Math.random() * d - d / 2
            },
            timestamp: new Date().getTime()
          };
          commit("setUserlocation", p);
          setTimeout(update, 2000);
        }
        update();
      }
    }

  }
})
