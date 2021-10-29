<!-- Contains a ResultBox for every workflow in Vuex store. -->
<template>
  <v-container class="bottomspace">
    <v-col cols="12" md="12">
      <h1 class="mb-2 teal--text">
        Results
      </h1>
      <v-row class="nomargin">
        <v-btn
          small
          class="bottomspace"
          :disabled="loading"
          @click="updateWorkflows"
        >
          Refresh
        </v-btn>
        <hour-glass class="loading-icon" :class="{ hidden: !loading }" />
      </v-row>
      <ResultBox
        v-for="workflow of workflows"
        :key="workflow.workflowId"
        :projectId="workflow.projectId"
        :sampleName="workflow.sampleName"
        :algorithm="workflow.algorithm"
        :workflowId="workflow.workflowId"
        :single="workflow.single"
        :species="workflow.species"
        :nwkTree="workflow.nwkTree"
        :status="workflow.status"
        :submitted="workflow.submitted"
      />
      <p v-if="noWorkflows">
        No computations launched yet.
      </p>
    </v-col>
  </v-container>
</template>

<script>
import { HourGlass } from 'vue-loading-spinner'
import ResultBox from '@/components/ResultBox'
export default {
  name: 'ResultsContainer',
  components: {
    HourGlass,
    ResultBox
  },
  data: () => ({
    loading: false
  }),
  computed: {
    workflows () {
      return this.$store.state.workflows
    },
    noWorkflows () {
      return this.$store.state.workflows.length === 0 && !this.loading
    }
  },
  mounted () {
    this.updateWorkflows()
  },
  methods: {
    async updateWorkflows () {
      this.loading = true
      await this.$store.dispatch('restoreWorkflows', this.$cookies.get('id_token'))
      this.loading = false
    }
  }
}
</script>

<style scoped>
.bottomspace {
  margin-bottom: 30px;
}

.nomargin {
  margin: 0;
}

.hidden {
  visibility: hidden;
  display: none;
}
</style>
