const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Returns a connection to the Cromwell instance on this server.
 * See https://cromwell.readthedocs.io/en/stable/api/RESTAPI/
 *
 * @returns axios instance
 */
const getCromwell = async () => {
  return await axios.create({ baseURL: 'http://localhost:8000/' });
};

/**
 * Formats the required FormData object for submitting a workflow request.
 * Details and schema:
 * https://cromwell.readthedocs.io/en/stable/api/RESTAPI/#submit-a-workflow-for-execution
 *
 * @param algorithm the algorithm used for this workflow
 * @param inputs workflow inputs such as sample accession number
 * @param refreshToken Google refresh token for authorising
 * @returns FormData object with all required fields
 */
const formatRequestBody = (algorithm, inputs, refreshToken) => {
  // FormData only has an empty constructor,
  // thus disabling eslint rule marking that as a warning
  // eslint-disable-next-line no-undef
  const bodyFormData = new FormData();

  const wdl = './algorithm/wdl-scripts/' + algorithm + '.wdl';
  bodyFormData.append('workflowSource', fs.createReadStream(wdl));

  const inputsUrl = './cromwell/inputs/' + process.env.PROJECT_ID + '.' + uuidv4() + '.json';
  fs.writeFileSync(inputsUrl, JSON.stringify(inputs));
  bodyFormData.append('workflowInputs', fs.createReadStream(inputsUrl));

  const optionsUrl = './cromwell/options/' + process.env.PROJECT_ID + '.' + uuidv4() + '.json';
  fs.writeFileSync(optionsUrl, JSON.stringify({ refresh_token: refreshToken }));
  bodyFormData.append('workflowOptions', fs.createReadStream(optionsUrl));

  bodyFormData.append('workflowType', 'WDL');
  bodyFormData.append('workflowTypeVersion', 'draft-2');

  return bodyFormData;
};

/**
 * @param workflowId id of assigned workflow
 * @returns Cromwell response or undefined if error (such as not NOT_FOUND)
 */
const getWorkflowStatus = async (workflowId) => {
  try {
    const cromwell = await getCromwell();

    const { data: result } = await cromwell.get(
      'api/workflows/v1/' + workflowId + '/status'
    );
    return result;
  } catch (e) {
    return undefined;
  }
};

module.exports = {
  getCromwell,
  formatRequestBody,
  getWorkflowStatus
};
