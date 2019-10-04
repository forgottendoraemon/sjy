import Vue from 'vue'
import Router from 'vue-router'
// import store from './store'
Vue.use(Router)


// async function beforeEnter(to, from, next) {
//   // 如果from为空（浏览器刷新），获取用户信息
//   if (from.name == null) {
//     await store.dispatch('updateUserInfo');
//   }
//   next();
// }

const routes = [
  {
    path: '/',
    name: 'map',
    component: () => import('./views/Map.vue')
  },
  {
    path: '/info',
    name: 'info',
    component: () => import('./views/Info.vue')
  },
  {
    path: '/user',
    component: () => import('./views/User_NavBar'),
    children: [
      {
        path: '',
        name: 'user',
        component: () => import("./views/user/User"),
      },
      {
        path: '/login',
        name: 'login',
        component: () => import('./views/user/Login')
      },
      {
        path: '/register',
        name: 'register',
        component: () => import('./views/user/Register')
      },
      {
        path: '/resetPwd',
        name: 'resetPwd',
        component: () => import('./views/user/ResetPwd')
      }
    ]
  }
]
const router = new Router({
  // mode: 'history',
  // base: process.env.BASE_URL,
  routes
})
// router.beforeEach(beforeEnter);
export default router; 
