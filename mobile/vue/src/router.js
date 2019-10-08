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
    path: '/navsearch',
    name: 'navsearch',
    component: () => import('./views/NavSearch.vue')
  },
  {
    path: '/layerlist',
    name: 'layerlist',
    component: () => import('./views/LayerList.vue')
  },
  {
    path: '/my',
    name: 'my',
    component: () => import('./views/My.vue')
  },
  {
    path: '/changepassowrd',
    name: 'changepassowrd',
    component: () => import('./views/ChangePassword.vue')
  },
  {
    path:'/restpassword',
    name: 'restpassword',
    component: () => import('./views/RestPassword.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./views/About.vue')
  },
  {
    path: '/help',
    name: 'help',
    component: () => import('./views/Help.vue')
  },
  {
    path: '/listview',
    name: 'listview',
    component: () => import('./views/ListView.vue')
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
