const express = require('express');
const router = express.Router();
const HttpStatus = require('http-status-codes');
const { readAbundances } = require('../util/resultsUtil');
const { google } = require('googleapis');
const { setupAuth, attachRefreshToken } = require('../util/google');

/**
 * @swagger
 * path:
 *  /results/bucket/:bucket/algorithm/:algo/workflow/:id/folder/:folder/species/:spec':
 *    get:
 *      summary: Returns the computation result to the frontend
 *      description: >
 *        User submits bucket link, algorithm name, workflow id, folder and species name
 *        Server tries to send back results, namely abundances information
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name : bucket
 *          in: req.params.bucket
 *          type : string
 *          example: cromwell-project-id-356665
 *        - name : algorithmName
 *          in: req.params.algo
 *          type : string
 *          example: StrainEst
 *        - name : workflowId
 *          in: req.params.id
 *          type : string
 *          example: 014b5fb7-0320-4e15-be77-f7f239b9cb36
 *        - name : folder
 *          in: req.params.folder
 *          type : string
 *          example: call-StrainEstSingle
 *        - name : species
 *          in: req.params.spec
 *          type : string
 *          example: ecoli
 *      responses:
 *        '200':
 *          description: >
 *            Computation results succesfully retrieved.
 *            Sending back information from abundances file
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                additionalProperties:
 *                  type: float
 *                example: {
                      "Esch_coli_KTE193_V1": 0.0001,
                      "Esch_coli_another_strain": 0.67003
                      }
 *
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
 *        '404':
 *          description: >
 *            not found
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example: 'not found Error message'
 *        '500':
 *          description: >
 *            Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example: 'Error message'
 */
router.get(
  '/bucket/:bucket/algorithm/:algo/workflow/:id/folder/:folder/species/:spec',
  async (req, res) => {
    const oAuth2Client = setupAuth();
    try {
      await attachRefreshToken(oAuth2Client, req.headers.authorization.substr(7));
    } catch (authErr) {
      res.status(HttpStatus.UNAUTHORIZED).json(authErr.message);
      return;
    }
    if (!oAuth2Client.credentials.refresh_token) {
      res.status(HttpStatus.UNAUTHORIZED).json('Error: no refresh_token');
      return;
    }
    try {
      const objectName = req.params.algo
                + '/' + req.params.id
                + '/' + req.params.folder
                + '/outputdir/abund.txt';
      const storage = google.storage('v1');
      const obj = await storage.objects.get({
        bucket: req.params.bucket,
        object: objectName,
        alt: 'media',
        auth: oAuth2Client
      });

      const abundances = readAbundances(obj.data, req.params.algo, req.params.spec);
      console.log(abundances);
      res.status(HttpStatus.OK).json(abundances);
    } catch (e) {
      console.log(e);
      if (e.code === '404') {
        res.status(HttpStatus.NOT_FOUND).json(e.message);
      } else if (e.message === 'invalid_grant') {
        res.status(HttpStatus.UNAUTHORIZED).json(e.message);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
      }
    }
  }
);
module.exports = router;
