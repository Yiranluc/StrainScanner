import api from '../api'

export default {

  /**
   * Requests a workflow execution.
   *
   * @param job           referenceSpecies, routeToReference, sample accession, single/paired reads
   * @param algorithm     chosen algorithm
   * @param idToken       Google id_token for saving workflow to db
   * @returns             workflow metadata if success, false if error
   */
  async compute (job, algorithm, idToken) {
    try {
      let jobAfterParse = job
      // Since in WDL, it natively does not support string parsing.
      // It would be much easier to do the string parsing here.
      switch (algorithm) {
        case 'StrainEst':
          jobAfterParse = parseStrainEst(job)
          break
        default:
          console.log('Parsing the reference species for the given algorithm is not defined.')
      }
      const inputs = {}
      inputs[algorithm + '.referenceSpecies'] = jobAfterParse.referenceSpecies
      inputs[algorithm + '.routeToReference'] = jobAfterParse.routeToReference
      inputs[algorithm + '.accession'] = jobAfterParse.accession
      inputs[algorithm + '.single'] = jobAfterParse.single
      const data = {
        algorithm: algorithm,
        inputs: inputs
      }
      const headers = {
        authorization: `Bearer ${idToken}`
      }
      const res = await api().post('/google-compute', data, {
        headers: headers
      })
      return res.data
    } catch (e) {
      return false
    }
  }
}

/**
 * The referenceSpecies and routeToReference of a job are parsed
 * , according to the requirements of StrainEst wdl script for input variables.
 *
 * @param job           referenceSpecies, routeToReference, sample accession, single/paired reads
 * @returns             a job after parsing
 */
const parseStrainEst = (job) => {
  // Formulate the folder name that StrainEst wants outside the wdl.
  // Example: Escherichia coli -> E_coli
  const words = job.referenceSpecies.split(' ')
  job.routeToReference = job.referenceSpecies.substr(0, 1)
    .concat('_')
    .concat(words[1])

  // Change the reference species name to what StrainEst requires.1
  // Example: Escherichia coli -> ecoli
  job.referenceSpecies = job.referenceSpecies.substr(0, 1).toLowerCase()
    .concat(words[1])
  return job
}
