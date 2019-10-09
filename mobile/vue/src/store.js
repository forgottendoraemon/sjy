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
    navTargetName: null,
    /**
     * 是否启动导航
     */
    isRouting: false,
    /**
     * 地图是否已经加载完成(底图图层已经添加)
     */
    mapLoad: false,
    /**
     * 以列表形式查看数据的的图层
     * {name,ids,source,visible,enableTable}
     */
    listViewLayerItem: null
  },
  mutations: {
    setUserInfo(state, newvalue) {
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

    setMapLoad(state, newvalue) {
      if (state.mapLoad !== newvalue) {
        state.mapLoad = newvalue;
      }
    },

    setListViewLayerItem(state, newvalue) {
      if (state.listViewLayerItem !== newvalue) {
        state.listViewLayerItem = newvalue;
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
        // 将UID保存起来，即便用户不登录，依然采用此ID
        localStorage.setItem("uid", result.data.id);
        return result;
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
        }, (error) => {
          console.error(error.message);
        }, {
          enableHighAccuracy: true,
          geocode: false
        });
        plus.geolocation.watchPosition(position => {
          commit("setUserlocation", position);
        }, (error) => {
          console.error(error.message);
        }, {
          enableHighAccuracy: true,
          geocode: false
        });
      }
      else {
        // 浏览器模拟位置
        const defaultPostiton = {
          coords: {
            latitude: 34.901172901335016,
            longitude: 98.16624942431474
          },
          timestamp: new Date().getTime()
        }
        commit("setUserlocation", defaultPostiton);
        const update = () => {
          const d = 0.03;
          const p = {
            coords: {
              latitude: 34.901172901335016 + Math.random() * d - d / 2,
              longitude: 98.16624942431474 + Math.random() * d - d / 2
              // latitude: 34.64784573228701,
              // longitude: 98.04338701978581
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
