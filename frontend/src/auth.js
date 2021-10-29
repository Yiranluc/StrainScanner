import Vue from 'vue'
import GAuth from 'vue-google-oauth2'

const gauthOption = {
  clientId: process.env.VUE_APP_CLIENT_ID,
  scope: 'https://www.googleapis.com/auth/cloud-platform '
    + 'https://www.googleapis.com/auth/devstorage.full_control '
    + 'https://www.googleapis.com/auth/userinfo.email '
    + 'https://www.googleapis.com/auth/userinfo.profile'
}

// If refresh_token is lost, consent screen is needed again to obtain it.
// This allows for dynamic re-prompting.
const setAuthPrompt = (prompt) => {
  gauthOption.prompt = prompt
  Vue.use(GAuth, gauthOption)
}

export default setAuthPrompt
