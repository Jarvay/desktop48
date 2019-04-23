import Vue from 'vue'
import axios from 'axios'
import './assets/sass/app.scss'

import App from './App'
import router from './router'

import iView from 'iview'
import 'iview/dist/styles/iview.css'

import Constant from '../renderer/assets/js/constants'

Vue.use(iView);

Vue.prototype.Constants = Constant;

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
