import api from '../api'

export default {

  /**
   * Gets available algorithms from the server.
   *
   * @returns array of algorithms, empty if an error occurred
   */
  async getAlgorithms () {
    try {
      const res = await api().get('/algorithm')
      return Array.isArray(res.data) ? res.data : []
    } catch (e) {
      return []
    }
  },

  /**
   * Gets available species for a given algorithm
   *
   * @param algorithm chosen algorithm
   * @returns array of reference species, empty if an error occurred
   */
  async getSpecies (algorithm) {
    try {
      const res = await api().get(`/algorithm/${algorithm}/species`)
      return Array.isArray(res.data) ? res.data : []
    } catch (e) {
      return []
    }
  }
}
