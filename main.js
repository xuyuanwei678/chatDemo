import Vue from 'vue'
import App from './App'


import httpApi from './common/httpApi'		//API接口配置文件
import HttpCache from './common/cache'
import $mConfig from '@/common/config.js';
import $mHelper from '@/utils/helper';		
import utils from "./utils/index.js";		//简化uniapp函数
import zIndex from "./utils/zIndex";		//规范z-index
import heImage from "./components/he-image.vue";	//封装style合并统一图片格式
import http from './common/http/axios.js'
import * as filters from 'common/filters/filters.js'

import moment from 'moment'; // 导入模块
moment.locale('zh-cn'); // 设置语言 或 moment.lang('zh-cn'); 
Vue.prototype.$moment = moment; // 赋值使用

//import $ from '@/static/plugins/jquery-3.2.1.min.js'
// import $ from '@/static/plugins/jquery-3.2.1.min.js'
// import s from '@/static/plugins/socket.io.js'
// import adapter from '@/static/plugins/adapter.js'
 //import Owt from '@/static/plugins/owt.js'
// Vue.prototype.$Owt = Owt
// import indexjs from '@/static/plugins/index.js'
// import restSample from '@/static/plugins/rest-sample.js'
// console.log(Owt)

// import test from '@/common/test/test.js'
// import SDPUtils from 'static/plugins/adapter.js'
console.log("加载完毕")



//引入webrtc相关文件
import Ics from '@/static/plugins/index.js'
Vue.prototype.$Ics = Ics


// import common from '@/assets/common'
// common.vueInit(Vue)



//element
// import ElementUI from 'element-ui'



// Vue.use(ElementUI)





import getUser from '@/assets/getUser'
Vue.prototype.queryHeadImg = getUser
//#ifdef H5
import confirm from '@/pages/index/common/confirm.vue'
Vue.component('confirm',confirm)
//#endif
//引入组件库
import uView from "uview-ui";
Vue.use(uView);

// 全局组件
import qyLoading from 'components/global/qy-loading.vue'
Vue.component('qy-loading',qyLoading);

// uView-vuex
let vuexStore = require('./common/store/$u.mixin.js')
Vue.mixin(vuexStore)

//全局过滤器
console.log("filter",filters)
Object.keys(filters).forEach(key =>{
	Vue.filter(key,filters[key])
})

//全局mixin
import shoproShare from '@/common/mixins/shopro-share'
Vue.mixin(shoproShare);


Vue.config.productionTip = false
Vue.prototype.$http = http;
Vue.prototype.$eventHub = Vue.prototype.$eventHub || new Vue()
Vue.prototype.$api = httpApi;
Vue.prototype.$SysCache = HttpCache;
Vue.prototype.$mConfig =$mConfig;
Vue.prototype.$mHelper = $mHelper;

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
