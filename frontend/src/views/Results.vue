<!-- Results view: displays user's workflows, their status, and if available, results. -->
<template>
  <v-app
    dark=""
    app
    class="blue-grey lighten-1"
  >
    <Navbar />
    <meta charset="utf-8">
    <v-container>
      <v-app
        :style="{background: $vuetify.theme.themes.light.background}"
        class="rounded"
      >
        <v-row>
          <ResultsContainer />
        </v-row>
      </v-app>
    </v-container>
  </v-app>
</template>

<script>
import Navbar from '@/components/Navbar'
import ResultsContainer from '@/components/ResultsContainer'

export default {
  name: 'Results',
  components: {
    Navbar,
    ResultsContainer
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

#sign_out:hover {
  cursor: pointer;
}
</style>
