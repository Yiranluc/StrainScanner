// Displays a simple barchart of the provided dataset.

import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: ['data', 'labels', 'options'],
  mounted () {
    this.renderChart({
      labels: this.labels,
      datasets: [
        {
          label: 'Relative abundance',
          backgroundColor: '#f87979',
          data: this.data
        }
      ]
    })
  }
}
