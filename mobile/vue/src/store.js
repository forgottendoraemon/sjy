import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// const host = location.host ? `${location.protocol}//${location.host}` : location.href.split("/index.html#/")[0];

export default new Vuex.Store({
  state: {
    userinfo: null,
    isLogin: false,//是否登录
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
    }
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

  }
})
