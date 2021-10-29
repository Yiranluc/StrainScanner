<template>
  <div>
    <v-radio-group
      v-model="displayAll"
      row
      class="display-all-radios"
    >
      <v-radio label="Whole tree" :value="true" />
      <v-radio label="Pruned tree" :value="false" />
    </v-radio-group>
    <svg :id="htmlId" />
  </div>
</template>

<script>
import * as d3 from 'd3'
require('phylotree')
export default {
  name: 'PhylogeneticTree',
  props: [
    'dataObject',
    'workflowId',
    'nwkTree'
  ],
  data: () => ({
    tree: undefined,
    displayAll: false
  }),
  computed: {
    htmlId () {
      return 'phylotree_' + this.workflowId
    }
  },
  watch: {
    dataObject (newValue) {
      if (this.nwkTree !== '') {
        this.prepareTree()
        this.pruneTree()
        this.tree.layout()
      }
    },
    displayAll (newValue) {
      if (this.nwkTree !== '') {
        if (newValue) {
          this.prepareTree()
          this.tree.layout()
        } else {
          this.prepareTree()
          this.pruneTree()
          this.tree.layout()
        }
      }
    }
  },
  methods: {
    prepareTree () {
      // create a tree layout object
      this.tree = d3.layout.phylotree()

      // render to this SVG element
      this.tree.svg(d3.select('#' + this.htmlId))

      // parse the .nwk into a d3 hierarchy object with additional fields
      this.tree(this.nwkTree)

      // Select those that are present for highlighting
      this.tree.modify_selection((node) => {
        return this.dataObject[node.target.name] !== undefined
      })
    },
    pruneTree () {
      // Select strains not present in the sample and delete them
      // Keep some context
      const root = this.tree.get_node_by_name('root')
      const leaves = this.tree.select_all_descendants(root, true, false)
      leaves.forEach((leaf, i) => {
        if (this.dataObject[leaf.name] === undefined && leaf.name !== 'root') {
          // Candidate for deleting;
          // check that it isn't a close relative of a present strain
          let isCloseRelative = false
          // Go three layers back or until the root (which has no parent)
          let ancestor = leaf
          for (let i = 0; i < 2; i++) {
            if (ancestor.parent) {
              ancestor = ancestor.parent
            }
          }
          // Check all descendants for identified strains
          const offspring = this.tree.select_all_descendants(ancestor, true, false)
          offspring.forEach((strain, i) => {
            if (this.dataObject[strain.name] !== undefined) {
              isCloseRelative = true
            }
          })
          // Delete only when no identified strains are close to this
          if (!isCloseRelative) {
            this.tree.delete_a_node(leaf)
          }
        }
      })
      // Update the tree to render only the kept strains
      this.tree.update()
    }
  }
}

</script>

<style>
@import '../../../node_modules/phylotree/phylotree.css';

.display-all-radios {
  padding-left: 24px;
}
</style>
