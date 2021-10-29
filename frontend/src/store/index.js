import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './actions'

export const defaultUser = {
  email: 'email@gmail.com',
  given_name: 'username',
  picture: 'https://image.flaticon.com/icons/svg/206/206875.svg'
}

const state = {
  isSignIn: false,
  user: defaultUser,
  workflows: []
}

Vue.use(Vuex)

export default new Vuex.Store({
  state,
  mutations,
  actions
})
