import api from '../api'

export default {

  /**
   * Get user workflows from backend.
   *
   * @param idToken Google id_token
   * @returns array of workflows, empty array in case of error
   */
  async getWorkflows (idToken) {
    try {
      const headers = {
        authorization: `Bearer ${idToken}`
      }
      const res = await api().get(
        '/workflow',
        { headers }
      )
      return res.data || []
    } catch (e) {
      return []
    }
  },

  /**
   * Get workflow status from backend.
   *
   * @param workflowId workflow id
   * @returns workflow status text, 'Error' in case of error
   */
  async getStatus (workflowId, idToken) {
    try {
      const headers = {
        authorization: `Bearer ${idToken}`
      }
      const res = await api().get(
        '/workflow/' + workflowId + '/status',
        { headers }
      )
      return res.data || 'Error'
    } catch (e) {
      return 'Error'
    }
  }
}
