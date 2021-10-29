export default {
  logIn (state) {
    state.isSignIn = true
  },
  logOut (state) {
    state.isSignIn = false
  },
  setUser (state, user) {
    state.user = {
      email: user.email,
      given_name: user.given_name,
      picture: user.picture
    }
  },
  addWorkflow (state, workflow) {
    state.workflows.unshift({
      workflowId: workflow.workflowId,
      submitted: workflow.submitted,
      finished: workflow.finished,
      algorithm: workflow.algorithm,
      species: workflow.species,
      projectId: workflow.projectId,
      sampleName: workflow.sampleName,
      single: workflow.single,
      nwkTree: workflow.nwkTree,
      status: workflow.status
    })
  },
  clearWorkflows (state) {
    state.workflows = []
  },
  updateWorkflow (state, { workflowId, updatedStatus }) {
    for (const workflow of state.workflows) {
      if (workflow.workflowId === workflowId) {
        workflow.status = updatedStatus
      }
    }
  }
}
