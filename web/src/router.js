import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import store from './store'

Vue.use(Router)

/**
 * 当进入某个路由后，更新当前路由状态值
 */
function beforeEnter(to, from, next){
  store.commit('updateCurrentRoute', to.path);
  next();
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
    
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./views/About.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/Login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('./views/Register.vue')
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('./views/Map.vue')
  }
];

routes.forEach(r=>r.beforeEnter=beforeEnter);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
