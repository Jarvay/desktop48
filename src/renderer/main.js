import Vue from 'vue'
import axios from 'axios'
import './assets/sass/app.scss'

import App from './App'
import router from './router'

import iView from 'iview'
import 'iview/dist/styles/iview.css'

import flvjs from 'flv.js'

// import VueVideoPlayer from 'vue-video-player'


Vue.use(iView);
// Vue.use(VueVideoPlayer);
Vue.prototype.$flvjs = flvjs;

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

window.axios = axios

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
