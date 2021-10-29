<!-- Navbar should be included in every view, it allows for switching between them. -->
<template>
  <nav>
    <v-navigation-drawer
      v-model="drawer"
      dark=""
      app
      class="blue-grey darken-1 accent-2 fullheight"
    >
      <v-layout
        column
        align-center
      >
        <v-flex class="mt-10 mb-8">
          <v-avatar>
            <v-icon large>
              fas fa-dna
            </v-icon>
          </v-avatar>
        </v-flex>
      </v-layout>
      <v-list>
        <v-list-item
          v-for="link in links"
          :key="link.text"
          router
          :to="link.route"
          active-class="border"
        >
          <v-list-item-action>
            <v-icon>{{ link.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ link.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <div id="iconsMadeBy">
        Icons made by <a
          href="https://www.flaticon.com/authors/freepik"
          title="Freepik"
        >Freepik</a> from <a
          href="https://www.flaticon.com/"
          title="Flaticon"
        >www.flaticon.com</a>
      </div>
    </v-navigation-drawer>
  </nav>
</template>

<script>
export default {
  components: {
  },
  data: () => ({
    drawer: true,
    links: [
      { icon: 'fas fa-home', text: 'Home', route: '/' },
      { icon: 'fas fa-chart-pie', text: 'Results', route: '/results' }
    ]
  })
}
</script>

<style scoped>
.border {
  border-left: 4px solid #2c3e50;
}

.fullheight {
  height: 100%;
}

#iconsMadeBy {
  text-align: center;
  color: #78909c;
  vertical-align: bottom;
}

#iconsMadeBy a {
  color: #78909c;
}
</style>
