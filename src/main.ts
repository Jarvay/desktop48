import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import routes from '@/assets/js/routes';

Vue.config.productionTip = false;

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location: any) {
  // @ts-ignore
  return originalPush.call(this, location).catch((err: any) => err);
};

Vue.use(VueRouter);
const router = new VueRouter({routes});

new Vue({
  render: (h) => h(App),
  router
}).$mount('#app');
