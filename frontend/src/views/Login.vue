<!-- Login view: user is presented with a button to log in and some description of the app. -->
<template>
  <v-app
    dark=""
    app
    class="blue-grey lighten-1"
  >
    <v-container>
      <v-app
        :style="{background: $vuetify.theme.themes.light.background}"
        class="rounded"
      >
        <v-row class="title">
          <h1 class="mb-2 teal--text">
            Log in
          </h1>
        </v-row>
        <v-row class="description">
          <p>Welcome to StrainScanner!</p>
          <p>
            StrainScanner is a web application specialized in facilitating the strain identification and relative abundance estimation
            process within metagemonic datasets. It takes advantage of strong computation power of Google Cloud Platform. It has
            an end-to-end pipeline which incorporates a straightforward GUI to download a specific sample from NCBI Sequence Reads
            Archive (SRA) and apply StrainEst algorithm to estimate the relative abundances of strains within the sample, uses Cromwell
            to launch each computation on Google Cloud, implements a results visualization page for inspecting the relative abundances and
            phylogenentic relationships among identified strains. This app is also designed to be open to extensions, for example, adding new
            algorithms and new reference species to the app.
          </p>
        </v-row>
        <v-row class="last">
          <v-col cols="12" md="4" />
          <v-col cols="12" md="5">
            <v-container>
              <GoogleButton />
            </v-container>
          </v-col>
          <v-col cols="12" md="3" />
        </v-row>
      </v-app>
    </v-container>
  </v-app>
</template>

<script>
import GoogleButton from '@/components/GoogleButton'
export default {
  name: 'Login',
  components: {
    GoogleButton
  }
}
</script>

<style scoped>
.rounded {
  border-radius: 30px;
  padding: 10%;
}
</style>
