import api from '../api'

export default {

  /**
   * Gets workflow results.
   * Returns false if they can't be retrieved (yet).
   *
   * @param projectId     Google project id
   * @param algorithm     algorithm, e.g. StrainEst
   * @param workflowId    workflow id
   * @param single        single/paired-end info
   * @param species       reference species
   * @param idToken       Google id_token for auth
   * @returns             abundance data if successful, false otherwise.
   */
  async getResults (projectId, algorithm, workflowId, single, species, idToken) {
    try {
      const url = '/results/bucket/cromwell-' + projectId
        + '/algorithm/' + algorithm
        + '/workflow/' + workflowId
        + '/folder/call-' + algorithm + (single ? 'Single' : 'Paired')
        + '/species/' + species
      const headers = {
        authorization: `Bearer ${idToken}`
      }
      const result = await api().get(url, { headers })
      return result.data
    } catch (e) {
      return false
    }
  }
}
