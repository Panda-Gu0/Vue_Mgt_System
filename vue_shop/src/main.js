import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式表
import '@/assets/css/global.css';
// 引入字体图标
import '@/assets/fonts/iconfont.css';
import '@/assets/font2/iconfont.css';
import TreeTable from 'vue-table-with-tree-grid';
// 导入 NProgress 的 js 及 css 文件
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 引入 day.js
var dayjs = require('dayjs');
Vue.prototype.dayjs = dayjs
Vue.config.productionTip = false
Vue.component('tree-table',TreeTable);
// 全局配置 axios
import axios from 'axios';
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'; // 配置根路径
// 通过 axios 请求拦截器添加 token，保证拥有获取数据的权限
// 在 request 拦截器展示进度条
axios.interceptors.request.use(config => {
  NProgress.start();
  // 为请求头对象添加 token 验证的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token');
  // 在最后必须 return config
  return config;
})
// 在 response 拦截器隐藏进度条
axios.interceptors.response.use(config => {
  NProgress.done();
  return config;
})
Vue.prototype.$http = axios;
// 将富文本编辑器注册为全局组件
Vue.use(VueQuillEditor)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')


