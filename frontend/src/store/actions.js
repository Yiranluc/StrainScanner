import Vue from 'vue'
import { defaultUser } from './index'
import router from '../router'
import TokenService from '../services/token'
import ComputeService from '@/services/compute'
import WorkflowService from '@/services/workflow'

export default {

  /**
   * Given an authCode, requests tokens from Google
   * and saves them in cookies. Sets user info.
   *
   * @param context  state
   * @param authCode Google authCode
   * @returns void
   */
  async logIn (context, authCode) {
    const tokens = await TokenService.getTokens(authCode)
    if (tokens) {
      // Auth successful, set cookies.
      Vue.$cookies.set('id_token', tokens.id_token)
    }
    const idToken = Vue.$cookies.get('id_token')
    const idInformation = await TokenService.getIdInformation(idToken)
    if (idInformation) {
      // All good, log in.
      context.commit('setUser', idInformation)
      context.commit('logIn')
      // Move to home page
      router.push('/')
    } else {
      // Token invalid
      context.dispatch('logOut')
    }
  },

  /**
   * Deletes cookies and removes user info from store.
   * Moves the user to login screen if they are not there already.
   *
   * @param context state
   * @returns void
   */
  logOut (context) {
    Vue.$cookies.remove('id_token')
    context.commit('setUser', defaultUser)
    context.commit('clearWorkflows')
    context.commit('logOut')
    if (router.currentRoute.path !== '/login') {
      router.push('/login')
    }
  },

  /**
   * Tries to restore user info from the id_token cookie
   * if the app has been reloaded.
   *
   * @param context state
   * @returns true/false according to success
   */
  async restoreLogin (context) {
    const idToken = Vue.$cookies.get('id_token')
    const idInformation = await TokenService.getIdInformation(idToken)
    if (idInformation) {
      // All good, log in.
      context.commit('setUser', idInformation)
      context.commit('logIn')
      return true
    } else {
      // Token invalid
      context.dispatch('logOut')
      return false
    }
  },

  /**
   * Requests a workflow execution.
   *
   * @param context     state
   * @param job         workflow inputs
   * @param algorithm   chosen algorithm
   * @returns workflow metadata if success, false otherwise
   */
  async uploadJob (context, { job, algorithm }) {
    // Save additional workflow info for the time of waiting
    const sampleName = job.accession
    const single = job.single
    const algo = algorithm
    // Request computation
    const jobResponse = await ComputeService.compute(
      job,
      algorithm,
      Vue.$cookies.get('id_token')
    )
    // If successful, save the new workflow
    if (jobResponse) {
      jobResponse.sampleName = sampleName
      jobResponse.single = single
      jobResponse.algorithm = algo
      context.commit('addWorkflow', jobResponse)
      return true
    } else {
      return false
    }
  },

  /**
   * Gets user workflows from backend if there are none at frontend.
   *
   * @param context state
   * @returns void
   */
  async restoreWorkflows (context, idToken) {
    context.commit('clearWorkflows')
    const workflows = await WorkflowService.getWorkflows(idToken)
    for (const workflow of workflows) {
      context.commit('addWorkflow', workflow)
    }
  },

  /**
   * updateWorkflow - description
   *
   * @param context state
   * @param workflowId workflow id
   * @param updatedStatus new status text
   * @returns void
   */
  updateWorkflow (context, { workflowId, updatedStatus }) {
    context.commit('updateWorkflow', { workflowId, updatedStatus })
  }
}
