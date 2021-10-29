import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'
import Login from './views/Login'
import Results from './views/Results'
import store from './store/index'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/login',
      component: Login,
      meta: {
        title: process.env.VUE_APP_TITLE
      }
    },
    {
      path: '/',
      component: Home,
      meta: {
        title: process.env.VUE_APP_TITLE
      }
    },
    {
      path: '/results',
      component: Results,
      meta: {
        title: process.env.VUE_APP_TITLE
      }
    }
  ]
})

// Hide other pages than login for not logged in users
router.beforeEach(async (to, from, next) => {
  if (to.path === '/login') {
    next()
  } else {
    const loginOk = await store.dispatch('restoreLogin')
    loginOk ? next() : next({ path: '/login' })
  }
})

export default router
