import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentRoute:"/"
  },
  mutations: {
    updateCurrentRoute(state, newvalue){
      if (state.currentRoute !== newvalue) {
        state.currentRoute = newvalue
      }
    }
  },
  actions: {
    
  }
})
