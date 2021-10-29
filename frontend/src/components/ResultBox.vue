<!-- ResultBox receives workflow metadata as props and fetches the status and results for it. -->
<template>
  <v-container class="resultBox">
    <v-row
      :class="{ finished: ready }"
      @click="toggleOpen"
    >
      <div class="container">
        <div class="computation-container">
          <ul class="computation-detail">
            <li>Sample {{ sampleName }} ({{ singlePaired }})</li>
            <li>Identification method: {{ algorithm }}</li>
            <li>Reference Species: {{ species }}</li>
            <li>Submitted: {{ localTime(submitted) }}</li>
          </ul>
        </div>
        <div class="icon-container">
          <div>
            <v-alert
              dense
              class="status-alert"
              :type="labelType"
            >
              {{ status }}
            </v-alert>
          </div>
          <div>
            <v-tooltip left>
              <template v-slot:activator="{on}">
                <div v-on="on">
                  <v-btn
                    small
                    :href="bucketLink"
                    target="_blank"
                  >
                    Open bucket
                  </v-btn>
                </div>
              </template>
              <span>See files in a Google bucket</span>
            </v-tooltip>
          </div>
        </div>
      </div>
    </v-row>
    <v-row>
      <div v-if="open" class="bar-chart-container">
        <bar-chart
          v-if="ready"
          :labels="labels"
          :data="data"
        />
      </div>
      <div class="phylogenetic-tree-container" :class="{ visible: open }">
        <p v-if="!nwkTreeOk" class="rounded">
          There is no newick file found for the current reference species.
          If you want to visualize the phylogenetic tree of this species, please add
          its nwk file according to the instructions in README.
        </p>
        <phylogenetic-tree
          class="phylotree"
          :class="{ visible: nwkTreeOk }"
          :dataObject="dataObject"
          :workflowId="workflowId"
          :nwkTree="nwkTree"
        />
      </div>
    </v-row>
  </v-container>
</template>

<script>
import WorkflowService from '@/services/workflow'
import ResultService from '@/services/results'
import BarChart from '@/components/BarChart'
import PhylogeneticTree from '@/components/PhylogeneticTree'

export default {
  name: 'ResultBox',
  components: {
    BarChart,
    PhylogeneticTree
  },
  props: [
    // Workflow metadata
    'projectId',
    'sampleName',
    'algorithm',
    'workflowId',
    'single',
    'species',
    'nwkTree',
    'status',
    'submitted'
  ],
  data: () => ({
    // X-axis
    labels: [],
    // Y-axis
    data: [],
    // O(1) lookup version of the data for phylotree
    dataObject: {},
    ready: false,
    open: false,
    timeout: undefined
  }),
  computed: {
    singlePaired () {
      return this.single ? 'single-end reads' : 'paired-end reads'
    },
    labelType () {
      return (this.status === 'Succeeded' && this.ready) ? 'success'
        : (this.status === 'Error' || this.status === 'Failed') ? 'error'
          : 'info'
    },
    bucketLink () {
      return 'https://console.cloud.google.com/storage/browser/cromwell-'
        + this.projectId
        + '/' + this.algorithm
        + '/' + this.workflowId
        + '?forceOnBucketsSortingFiltering=false&project=' + this.projectId
    },
    nwkTreeOk () {
      return this.nwkTree !== ''
    }
  },
  async mounted () {
    if (this.status !== 'Succeeded' && this.status !== 'Failed') {
      await this.getStatus()
    }
    if (this.status === 'Succeeded') {
      this.retrieveResults()
    }
  },
  beforeDestroy () {
    clearTimeout(this.timeout)
  },
  methods: {
    async getStatus () {
      // Check if results are ready, retry in a minute if not
      const updatedStatus = await WorkflowService.getStatus(
        this.workflowId,
        this.$cookies.get('id_token')
      )
      if (updatedStatus === 'Submitted') {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(this.getStatus, 5000)
      }
      if (updatedStatus === 'Running') {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(this.getStatus, 60000)
      }
      if (updatedStatus === 'Succeeded') {
        this.retrieveResults()
      }
      this.$store.dispatch('updateWorkflow', {
        workflowId: this.workflowId,
        updatedStatus
      })
    },
    async retrieveResults () {
      // Request results
      const result = await ResultService.getResults(
        this.projectId,
        this.algorithm,
        this.workflowId,
        this.single,
        this.species,
        this.$cookies.get('id_token')
      )
      // Set data if available
      if (result) {
        this.labels = Object.keys(result)
        this.data = Object.values(result)
        this.dataObject = result
        this.ready = true
      }
    },
    toggleOpen () {
      if (this.ready) {
        this.open = !this.open
      }
    },
    localTime (utcTime) {
      const local = new Date(utcTime).toString()
      const split = local.split(' ')
      let localFormatted = ''
      for (let i = 0; i < 5; i++) {
        if (i !== 4) localFormatted += split[i] + ' '
        else localFormatted += split[i]
      }
      return localFormatted
    }
  }
}
</script>

<style scoped>
.resultBox {
  border: solid 1px #95a6a5;
  border-radius: 10px;
  margin-bottom: 15px;
}

.computation-detail li {
  margin: 0 0 20px 0;
}

.bar-chart-container {
  float: left;
}

.container {
  width: 97%;
}

.rounded {
  border-radius: 30px;
  padding: 8%;
  margin: 10%;
  width: 420px;
  background-color: rgba(120, 144, 156, 0.5);
  opacity: 50%;
}

.computation-container {
  float: left;
}

.icon-container {
  overflow: hidden;
  float: right;
}

.status-alert {
  width: 165px;
}

.phylogenetic-tree-container {
  float: left;
  display: none;
}

.phylotree {
  overflow-x: scroll;
  overflow-y: scroll;
  height: 600px;
  width: 625px;
  display: none;
}

.finished {
  cursor: pointer;
}

.visible {
  display: block;
}
</style>
