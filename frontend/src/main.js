import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import VueCookies from 'vue-cookies'
import store from './store/index'
import setAuthPrompt from './auth'

setAuthPrompt('select_account')

Vue.use(VueCookies)

Vue.config.productionTip = false

new Vue({
  vuetify,
  store,
  router,
  render: h => h(App)
}).$mount('#app')
