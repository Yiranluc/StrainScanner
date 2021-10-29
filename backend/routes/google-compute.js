const express = require('express');
const router = express.Router();
const HttpStatus = require('http-status-codes');
const { getCromwell, formatRequestBody } = require('../util/cromwellUtil');
const { getNwkTree } = require('../util/resultsUtil');
const { setupAuth, createBucket, getPayload } = require('../util/google');
const { addWorkflow, getToken } = require('../util/users');

/**
 * @swagger
 * path:
 *  /google-compute/:
 *    post:
 *      summary: Launches a computation as specified in the request body.
 *      description: >
 *        User submits algorithm name, inputs object and refresh token
 *        Server submits cromwell request with specified details
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name : algorithmName
 *          in: req.body.algorithm
 *          type : string
 *          example: StrainEst
 *        - name : inputs
 *          in: req.body.inputs
 *          schema:
 *            type: object
 *            properties:
 *              referenceSpecies:
 *                type: string
 *                example: ecoli
 *                description: species to check genomic sample on
 *              routeToRefrence:
 *                type: string
 *                example: E_coli
 *                description: reference species formatted in a cromwell friendly way
 *              accessionNumber:
 *                type: string
 *                example: SRR172903
 *                description: accession number
 *              single:
 *                type: boolean
 *                example: true
 *                description: user specifies if sample is single ended or pair ended reads
 *      responses:
 *        '201':
 *          description: Computation succesfully submitted to cromwell.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  workflowId:
 *                    type: string
 *                    description: cromwell workflowId
 *                    example: CROMWELLWORKFLOWID
 *                  submitted:
 *                    type: date
 *                    description: date of worflow submission
 *                    example: 2020-06-17T13:06:22.538+00:00
 *                  finished:
 *                    type: boolean
 *                    description: is computation finished?
 *                    example: true
 *                  algorithm:
 *                    type : string
 *                    description: algorithm name that is being used
 *                    example: StrainEst
 *                  species:
 *                    type: string
 *                    description: species to check genomic sample on
 *                    example: ecoli
 *                  projectId:
 *                    type: string
 *                    description: google project id
 *                    example: grand-bridge-276413
 *                  sampleName:
 *                    type: string
 *                    description: accession number
 *                    example: SRR172903
 *                  single:
 *                    type: boolean
 *                    description: user specifies if sample is single ended or pair ended reads
 *                    example: true
 *                  status:
 *                    type: string
 *                    description: workflow status
 *                    example: submitted
 *        '401':
 *          description: >
 *            Many possible errors, the most frequent one is a
 *            missing, expired, or invalid id_token OR refresh_token. One way to repair this is to go to
 *            https://myaccount.google.com/permissions?pli=1 and remove app from permission list, forcing repermission of app
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example: 'Error: no refresh_token'
 *        '500':
 *          description: >
 *            Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example: 'Error message'
 */
router.post('/', async (req, res) => {
  try {
    let payload;
    let refreshToken;
    try {
      const oAuth2Client = setupAuth();
      payload = await getPayload(
        oAuth2Client,
        req.headers.authorization.substr(7)
      );
      const { token } = await getToken(payload.email);
      refreshToken = token;
      // Ensure there is a bucket and the refresh_token is valid
      oAuth2Client.setCredentials({
        refresh_token: refreshToken
      });
      await createBucket(process.env.PROJECT_ID, oAuth2Client);
    } catch (authErr) {
      res.status(HttpStatus.UNAUTHORIZED).json(authErr.message);
      return;
    }
    if (!refreshToken) {
      res.status(HttpStatus.UNAUTHORIZED).json('Error: no refresh_token');
      return;
    }
    // format the request and launch computation
    const formData = formatRequestBody(
      req.body.algorithm,
      req.body.inputs,
      refreshToken
    );
    const cromwell = await getCromwell();
    const { data } = await cromwell.post(
      'api/workflows/v1',
      formData,
      { headers: formData.getHeaders() }
    );
    // save the workflow to db, attach the nwk tree file and respond
    const workflow = {
      workflowId: data.id,
      submitted: new Date(),
      finished: null,
      algorithm: req.body.algorithm,
      species: req.body.inputs[req.body.algorithm + '.referenceSpecies'],
      projectId: process.env.PROJECT_ID,
      sampleName: req.body.inputs[req.body.algorithm + '.accession'],
      single: req.body.inputs[req.body.algorithm + '.single'],
      status: 'Submitted'
    };
    const adding = await addWorkflow(payload.email, workflow);
    if (adding.status !== HttpStatus.OK) {
      throw new Error('Database error: ' + adding.message);
    }
    workflow.nwkTree = getNwkTree(workflow.species);
    res.status(HttpStatus.CREATED).json(workflow);
  } catch (e) {
    console.log(e);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
  }
});

module.exports = router;
