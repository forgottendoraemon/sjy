import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import store from './store'

Vue.use(Router)


async function beforeEnter(to, from, next){
  // 如果from为空（浏览器刷新），获取用户信息
  if(from.name == null){
    await store.dispatch('updateUserInfo');
  }
  // 更新当前路由的值
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
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('./views/Admin.vue'),
    children: [
      {
        path: '',
        beforeEnter: (to, from, next) => {
          next({
            path: `/admin/users`
          });
        }
      },
      {
        path: 'users',
        name: 'users',
        title: '用户管理',
        component: resolve => require(['@/views/admin/Users'], resolve),
      }
    ]
  }
];

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(beforeEnter);


export default router;
