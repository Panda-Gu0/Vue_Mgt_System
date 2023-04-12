import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '@/components/Login.vue';
import Home from '@/components/Home.vue';
import Welcome from '@/components/Welcome.vue';
import User from '@/components/user/User.vue';
import Rights from '@/components/power/Rights.vue';
import Roles from '@/components/power/Roles.vue';
import Cate from '@/components/goods/Cate.vue';
import Params from '@/components/goods/Params.vue';
import List from '@/components/goods/List.vue';
import Add from '@/components/goods/Add.vue';
import Order from '@/components/order/Order.vue';
import Report from '@/components/report/Report.vue'
Vue.use(VueRouter)

const routes = [
      { path: '/', redirect: '/login'  }, // 路由重定向
      { path: '/login', component: Login },
      { path: '/home', 
        component: Home,
        redirect: '/welcome',
        children: [
          { path: '/welcome', component: Welcome },
          {  path: '/users', component: User },
          { path: '/rights', component: Rights },
          { path: '/roles', component: Roles },
          { path: '/categories', component: Cate },
          { path: '/params', component: Params },
          { path: '/goods', component: List },
          { path: '/goods/add', component: Add },
          { path: '/orders', component: Order },
          { path: '/reports', component: Report }
        ] }
      
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to,from,next) => {
  // to 表示将要访问的路径
  // from 表示从哪个路径跳转过来
  // next 是一个函数，表示放行
  if(to.path === '/login') return next();  // 访问登录界面直接放行
  const tokenStr = window.sessionStorage.getItem('token'); // 访问后台主界面检查是否携带 token
  if(!tokenStr) return next('/login'); // 本地没有 token ，强制跳转回登录界面
  next(); // 本地已获取并存储 token，直接放行
})
export default router
