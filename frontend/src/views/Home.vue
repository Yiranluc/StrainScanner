<!-- Home view: displays the configuration view where the user can launch a workflow -->
<template>
  <v-app
    dark=""
    app
    class="blue-grey lighten-1"
  >
    <Navbar />
    <v-container>
      <v-app
        :style="{background: $vuetify.theme.themes.light.background}"
        class="rounded"
      >
        <v-row>
          <v-col
            cols="12"
            md="8"
            class="ligne"
          >
            <Configure />
          </v-col>
          <v-col cols="12" md="4">
            <UserCard />
          </v-col>
        </v-row>
      </v-app>
    </v-container>
  </v-app>
</template>

<script>
import Navbar from '@/components/Navbar'
import Configure from '@/components/Configure'
import UserCard from '@/components/UserCard'
export default {
  name: 'Home',
  components: {
    Navbar,
    Configure,
    UserCard
  },
  computed: {
    theme () {
      return this.$vuetify.theme ? 'dark' : 'light'
    }
  }
}
</script>

<style scoped>
.rounded {
  border-radius: 30px;
  padding: 30px;
}

.ligne {
  border-right: solid 1px #95a6a5;
}
</style>
