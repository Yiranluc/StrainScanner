const express = require('express');
const router = express.Router();
const HttpStatus = require('http-status-codes');
const { setupAuth, getPayload } = require('../util/google');
const { getCromwell, getWorkflowStatus } = require('../util/cromwellUtil');
const { getWorkflows, getStatus, updateStatus } = require('../util/users');
const { getNwkTree } = require('../util/resultsUtil');
const { handle } = require('../util/errorHandling');

/**
 * @swagger
 * path:
 *  /workflow/:
 *    get:
 *      summary: Gets a list of workflows the user has submitted
 *      description: >
 *        Frontend sends request,
 *        server request the list of workflows given the user's email,
 *        database returns the list of workflows to the server,
 *        the server returns the list of workflows
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Ok, returning list of workflows.
 *          content:
 *            application/json:
 *              schema:
 *                name: workflows_array
 *                type: array
 *                items:
 *                  _id: string
 *                  workflowId: string
 *                  submitted: date
 *                  finished: date
 *                  algorithm: string
 *                  species: string
 *                  projectId: string
 *                  sampleName: string
 *                  single: boolean
 *                  status: string
 *                  type: string
 *                  nwkTree: string
 *        '401':
 *          description: >
 *            Many possible errors, the most frequent one is a
 *            missing, expired, or invalid id_token.
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example: 'Error: no id_token'
 *        '500':
 *          description: >
 *            Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example: 'Error message'
 */
router.get('/', async (req, res) => {
  try {
    const oAuth2Client = setupAuth();
    let payload;
    try {
      payload = await getPayload(
        oAuth2Client,
        req.headers.authorization.substr(7)
      );
    } catch (authErr) {
      res.status(HttpStatus.UNAUTHORIZED).json(authErr.message);
      return;
    }
    if (payload && payload.email) {
      // Get user workflows from db
      const { workflows } = await getWorkflows(payload.email);
      // Attach nwk trees
      const workflowsWithNwk = workflows.map(workflow => ({
        ...workflow._doc,
        nwkTree: getNwkTree(workflow.species)
      }));
      res.status(HttpStatus.OK).json(workflowsWithNwk.reverse());
    } else {
      console.log('Payload does not contain email');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    }
  } catch (e) {
    console.log(e);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
  }
});

/**
 * @swagger
 * path:
 *  /workflow/:workflowId/status/:
 *    get:
 *      summary: Gets the status of a given workflow
 *      description: >
 *        Frontend sends request,
 *        server request status of a workflow given the workflowId from the database,
 *        server requests Cromwell instance for the status of the workflow given the workflowId,
 *        database returns status of the workflow and updates if needed,
 *        the server returns status of the workflow
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Ok, returning the status of the workflow.
 *          content:
 *            application/json:
 *              schema:
 *                name: workflow_status
 *                type: string
 *                example: 'Running'
 *        '401':
 *          description: >
 *            Many possible errors, the most frequent one is a
 *            missing, expired, or invalid id_token.
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example: 'Error: no id_token'
 *        '404':
 *          description: Workflow not found
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example : 'Not found error'
 *        '500':
 *          description: >
 *            Internal server error, either problem with Cromwell or the database,
 *            or the payload does not contain an email
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 */
router.get('/:workflowId/status', async (req, res) => {
  try {
    // Authenticate
    const oAuth2Client = setupAuth();
    let email;
    try {
      const payload = await getPayload(
        oAuth2Client,
        req.headers.authorization.substr(7)
      );
      email = payload.email;
    } catch (authErr) {
      res.status(HttpStatus.UNAUTHORIZED).json(authErr.message);
      return;
    }
    // Get workflow status from db
    const workflowId = req.params.workflowId;
    const oldStatus = (await getStatus(email, workflowId)).workflowStatus;
    if (!oldStatus) {
      res.status(HttpStatus.NOT_FOUND).end();
      return;
    }
    // Ask if Cromwell has any new info on it
    const workflow = await getWorkflowStatus(workflowId);
    if (workflow && workflow.status !== oldStatus) {
      // If yes, update
      const response = await updateStatus(email, workflowId, workflow.status);
      if (response.status !== HttpStatus.OK) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
        return;
      }
    }
    // Send up to date status response
    res.status(HttpStatus.OK).json(workflow ? workflow.status : oldStatus);
  } catch (e) {
    console.log(e);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
  }
});

/**
 * @swagger
 * path:
 *  /workflow/:workflowId/outputs:
 *    get:
 *      summary: Gets the outputs of a given workflow even if it isn't completed yet
 *      description: >
 *        Frontend sends request,
 *        server requests outputs of a workflow given the workflowId from the Cromwell instance,
 *        server requests Cromwell instance for the outputs of the workflow given the workflowId,
 *        the server returns outputs of the workflow
 *      responses:
 *        '200':
 *          description: Ok, returning the outputs of the workflow.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                additionalProperties:
 *                  string: string
 *        '403':
 *          description: WorkflowId is malformed  (workflowId does not conform to the Cromwell workflowId format)
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *        '404':
 *          description: Workflow not found
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *        '500':
 *          description: >
 *            Internal server error, problem with Cromwell
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 */
router.get('/:workflowId/outputs', async (req, res) => {
  try {
    const cromwell = await getCromwell();

    const { data: outputs } = await cromwell.get(
      'api/workflows/v1/' + req.params.workflowId + '/outputs'
    );
    res.status(HttpStatus.OK).json(outputs);
  } catch (e) {
    handle(res, e);
  }
});

/**
 * @swagger
 * path:
 *  /workflow/abort:
 *    post:
 *      summary: Aborts the workflow with the given workflowId
 *      description: >
 *        Frontend sends request,
 *        server requests the Cromwell instance to abort the workflow,
 *        the server returns if Cromwell aborted successfully
 *      parameters:
 *       - name : workflowId
 *         in : req.body.workflowId
 *         type : string
 *      responses:
 *        '200':
 *          description: Ok, aborted the workflow.
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example: Aborted
 *        '403':
 *          description: Workflow has already completed
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *        '404':
 *          description: Workflow not found
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *        '500':
 *          description: >
 *            Internal server error, problem with Cromwell
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 */
router.post('/abort/', async (req, res) => {
  try {
    const cromwell = await getCromwell();

    const { data: response } = await cromwell.post(
      'api/workflows/v1/' + req.body.workflowId + '/abort'
    );
    res.status(HttpStatus.OK).json(response);
  } catch (e) {
    handle(res, e);
  }
});

module.exports = router;
