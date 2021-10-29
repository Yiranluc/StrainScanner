import axios from 'axios'
import HttpStatus from 'http-status-codes'
import store from './store/index'

export default () => {
  const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:3001/'
  })
  api.interceptors.response.use(
    function (response) {
      return response
    },
    function (error) {
      switch (error.response.status) {
        case HttpStatus.UNAUTHORIZED:
          window.alert('Unauthorized. ' + error.response.data)
          store.dispatch('logOut')
          break
        case HttpStatus.SERVICE_UNAVAILABLE:
          window.alert('Service unavailable. ' + error.response.data)
          break
        default:
          break
      }
      return Promise.reject(error)
    }
  )

  return api
}
