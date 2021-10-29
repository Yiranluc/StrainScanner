<!-- Configure section: holds all the controls necessary to adjust and launch a workflow. -->
<template>
  <v-container class="bottomBorder">
    <v-col cols="12" md="12">
      <h1 class="mb-2 teal--text">
        Configuration
      </h1>
      <v-row>
        <div class="dropdownsContainer">
          <v-tooltip top>
            <template v-slot:activator="{on}">
              <div v-on="on">
                <v-select
                  v-model="algorithm"
                  class="dropdown"
                  :items="algorithms"
                  label="Algorithm"
                  @change="downloadSpecies"
                />
              </div>
            </template>
            <span>Select algorithm to run on data</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{on}">
              <div v-on="on">
                <v-select
                  v-model="job.referenceSpecies"
                  class="dropdown"
                  :items="refSpecies"
                  label="Species"
                />
              </div>
            </template>
            <span>Select species</span>
          </v-tooltip>
        </div>
      </v-row>
      <v-row>
        <v-tooltip right>
          <template v-slot:activator="{on}">
            <div class="inlineBlock" v-on="on">
              <v-text-field
                v-model="job.accession"
                :maxlength="20"
                class="textField"
                label="SRA accession number"
              />
            </div>
          </template>
          <span>Enter the species accession number</span>
        </v-tooltip>
      </v-row>
      <v-row>
        <div class="inlineBlock">
          <v-radio-group v-model="job.single" row>
            <v-radio label="Single-end" :value="true" />
            <v-radio label="Paired-end" :value="false" />
          </v-radio-group>
        </div>
      </v-row>
      <v-row>
        <v-btn
          class="text-none vertSpace"
          color="success"
          :disabled="runDisabled"
          @click="uploadJob"
        >
          Run {{ algorithm }}
        </v-btn>
        <hour-glass class="vertSpace" :class="{ hidden: !loading }" />
      </v-row>
    </v-col>
  </v-container>
</template>

<script>
import AlgorithmService from '@/services/algorithm'
import { HourGlass } from 'vue-loading-spinner'

export default {
  name: 'Configure',
  components: {
    HourGlass
  },
  data: () => ({
    // Available algorithms on this server
    algorithms: [],
    // Chosen algorithm
    algorithm: '',
    // Available reference species for this algorithm
    refSpecies: [],
    // Workflow metadata under construction
    job: {
      referenceSpecies: '',
      accession: '',
      single: true
    },
    // Whether we await a response to a workflow execution request
    loading: false,
    // Whether the ok-text should be displayed to mark successful submission
    ok: false
  }),
  computed: {
    // The Run button is disabled when one or more of the missing fields are empty
    runDisabled () {
      return (!this.job.referenceSpecies || !this.job.accession || !this.algorithm)
    }
  },
  // Fetches the available algorithms
  async mounted () {
    this.algorithms = await AlgorithmService.getAlgorithms()
  },
  methods: {
    async uploadJob () {
      // Display hourglass
      this.loading = true
      // Request a workflow execution
      const submit = await this.$store.dispatch(
        'uploadJob',
        {
          job: this.job,
          algorithm: this.algorithm
        }
      )
      // Hide hourglass
      this.loading = false
      if (submit) {
        window.alert('Workflow submitted')
      } else {
        window.alert('Unsuccessful')
      }
    },
    // Gets available reference species for a chosen algorithm
    async downloadSpecies () {
      this.refSpecies = await AlgorithmService.getSpecies(this.algorithm)
    }
  }
}
</script>

<style scoped>
.bottomBorder {
  padding-bottom: 30px;
  border-bottom: solid 1px #95a6a5;
}

.dropdownsContainer {
  width: 70%;
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
}

.dropdown {
  margin-right: 10px;
}

.inlineBlock {
  display: inline-block;
}

.textField {
  width: 200px;
  height: 20%;
  display: inline-block;
}

.vertSpace {
  margin-top: 30px;
}

.hidden {
  visibility: hidden;
  display: none;
}
</style>
