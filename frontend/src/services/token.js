import api from '../api'

export default {

  /**
   * Exchanges authCode for tokens.
   *
   * @param authCode Google authCode
   * @returns tokens if success, false if not
   */
  async getTokens (authCode) {
    try {
      const response = await api().post('/google-auth', {
        authCode: authCode
      })
      return response.data
    } catch (e) {
      return false
    }
  },

  /**
   * Returns user information given an id_token.
   *
   * @param idToken Google id_token
   * @returns user info if success, false if not
   */
  async getIdInformation (idToken) {
    try {
      const headers = {
        authorization: `Bearer ${idToken}`
      }
      const response = await api().get('/google-auth', { headers })
      return response.data
    } catch (e) {
      return false
    }
  }
}
