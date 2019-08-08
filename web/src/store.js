import Vue from 'vue'
import Vuex from 'vuex'
import axios from '@/assets/js/axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentRoute: "/",
    userinfo: null,
    isLogin: false, // 是否已登陆
    isAdministrator: false, // 是否是管理员
    isShowHeaderMenu: true, // 是否显示 ‘登录’， ‘注册’ menu item
    isAsiderOpen: false,
    LayersList: [],
    currentSelectFeature: null,
    currentSelectLayerInfo: null,
    tableViewLayerInfo: null,
    WarningLevel: null,
    peopleCount: 0,
    changePwDiaVisible:false,
    addUserDigVisible:false,
  },
  mutations: {
    updateCurrentRoute(state, newvalue) {
      window.console.log(`updateCurrentRoute = ${newvalue}`);
      if (state.currentRoute !== newvalue) {
        state.currentRoute = newvalue
      }
    },
    /**
     * 更新用户信息
     * @param {*} state 
     * @param {*} newvalue 
     */
    setUserInfo(state, newvalue) {
      window.console.log(`setUserInfo = ${newvalue}`);
      if (state.userinfo !== newvalue) {
        if (newvalue) {
          state.isLogin = true;
          state.isAdministrator = newvalue.isAdministrator;
          state.isShowHeaderMenu = false;
        }
        else {
          state.isLogin = false;
          state.isAdministrator = false;
        }
        state.userinfo = newvalue;
      }
    },
    setIsShowHeaderMenu(state, newvalue) {
      if (state.isShowHeaderMenu !== newvalue) {
        state.isShowHeaderMenu = newvalue
      }
    },
    toggleAsiderOpen(state) {
      state.isAsiderOpen = !state.isAsiderOpen;
    },
    setLayerList(state, newvalue) {
      if (state.LayersList !== newvalue) {
        state.LayersList = newvalue
      }
    },
    setCurrentSelectFeature(state, newvalue) {
      if (state.currentSelectFeature !== newvalue) {
        state.currentSelectFeature = newvalue
      }
    },
    setCurrentSelectLayerInfo(state, newvalue) {
      if (state.currentSelectLayerInfo !== newvalue) {
        state.currentSelectLayerInfo = newvalue
      }
    },
    setTableViewLayerInfo(state, newvalue) {
      if (state.tableViewLayerInfo !== newvalue) {
        state.tableViewLayerInfo = newvalue
      }
    },
    setChangePwDiaVisible(state, newvalue){
      if (state.changePwDiaVisible !== newvalue) {
        state.changePwDiaVisible = newvalue
      }
    },
    setAddUserDigVisible(state, newvalue){
      if (state.addUserDigVisible !== newvalue) {
        state.addUserDigVisible = newvalue
      }
    }
  },
  actions: {
    /**
     * 从服务器获取用户信息
     */
    async updateUserInfo() {
      try {
        const result = await axios.get('/user/user');
        this.commit('setUserInfo', result.data);
      } catch (error) {
        this.commit('setUserInfo', null);
      }
    },
    /**
     * 退出并更新用户信息
     */
    async logout() {
      try {
        await axios.get('/user/logout');
        this.commit('setUserInfo', null);
      } catch (error) {
        this.commit('setUserInfo', null);
      }
    },
    /**
     * 更新预警级别和园区人数
     */
    async updateWarningLevel() {
      const result = await axios.get('/api/locations/warninglevel');
      const { level, peopleCount } = result.data;
      
      if (this.state.WarningLevel) {
        if (!level) {
          this.state.WarningLevel = level;
        }
        else if (level.level !== this.state.WarningLevel.level) {
          this.state.WarningLevel = level;
        }
      }
      else {
        if (level) {
          this.state.WarningLevel = level;
        }
      }

      if (this.state.peopleCount !== peopleCount) {
        this.state.peopleCount = peopleCount;
      }
    }
  }
})
