import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
      {
          path:'/',
          component:require('../components/Home').default
      },
      {
          path:'/flvjs/:liveId',
          component:require('../components/FlvJs').default
      },
      {
          path:'/videojs/:liveId',
          component:require('../components/VideoJs').default
      },
      {
          path: '*',
          redirect: '/'
      }
  ]
})
