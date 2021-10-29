<!-- Allows the user to log in with Google. -->
<template>
  <div @mouseup="handleClickSignIn">
    <img
      class="google_button fit"
      :class="{ button: isInit }"
      :src="buttonImg"
      alt="Sign in with Google"
      @mousedown="loginPressed=true"
      @mouseup="loginPressed=false"
      @mouseleave="loginPressed=false"
    >
    <hour-glass
      v-if="loading"
      class="hour-glass"
    />
  </div>
</template>

<script src="https://apis.google.com/js/platform.js?onload=init" async defer></script>
<script>

import setAuthPrompt from '../auth'
import { HourGlass } from 'vue-loading-spinner'

export default {
  name: 'GoogleButton',
  components: {
    HourGlass
  },
  data () {
    return {
      loginPressed: false,
      isInit: false,
      loading: false
    }
  },
  computed: {
    buttonImg: function () {
      return (!this || !this.isInit)
        ? require('../assets/google-buttons/btn_google_signin_light_disabled_web@2x.png')
        : (this.loginPressed
          ? require('../assets/google-buttons/btn_google_signin_light_pressed_web@2x.png')
          : require('../assets/google-buttons/btn_google_signin_light_normal_web@2x.png')
        )
    }
  },
  mounted () {
    setAuthPrompt('consent')
    const that = this
    const checkGauthLoad = setInterval(function () {
      that.isInit = that.$gAuth.isInit
      if (that.isInit) clearInterval(checkGauthLoad)
    }, 200)
  },
  methods: {
    async handleClickSignIn () {
      try {
        //get refresh token from db, if null ask for consent
        const authCode = await this.$gAuth.getAuthCode()
        this.loading=true
        this.$store.dispatch('logIn', authCode)
      } catch (e) {
        window.alert('Error connecting to Google.')
      }
    }
  }
}
</script>

<style scoped>
.fit {
  max-width: -webkit-fill-available;
  max-width: -moz-fill-available;
  max-width: stretch;
  display: block;
  width: 80%;
  height: auto;
  float: left;
}

.hour-glass {
  margin-top: 12px;
  float: right;
}

.button:hover {
  cursor: pointer;
}
</style>
