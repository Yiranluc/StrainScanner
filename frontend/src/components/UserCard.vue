<!-- Displays user data and allows them to sign out. -->
<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="12"
      >
        <v-list-item>
          <v-list-item-avatar>
            <img :src="picture">
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ given_name }}</v-list-item-title>
            <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-icon
                  id="sign_out"
                  v-on="on"
                  @click="handleClickSignOut"
                >
                  fas fa-sign-out-alt
                </v-icon>
              </template>
              <span>Sign out</span>
            </v-tooltip>
          </v-list-item-action>
        </v-list-item>
      </v-col>
    </v-row>
  </v-container>
</template>

<script src="https://apis.google.com/js/platform.js?onload=init" async defer></script>
<script>
export default {
  name: 'UserCard',
  computed: {
    given_name () {
      return this.$store.state.user.given_name
    },
    email () {
      return this.$store.state.user.email
    },
    picture () {
      return this.$store.state.user.picture
    }
  },
  methods: {
    async handleClickSignOut () {
        await this.$gAuth.signOut
        this.$store.dispatch('logOut')
    }
  }
}
</script>

<style scoped>
#sign_out:hover {
  cursor: pointer;
}
</style>
