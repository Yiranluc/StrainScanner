const express = require('express');
const router = express.Router();
const fs = require('fs');
const HttpStatus = require('http-status-codes');

/**
 * @swagger
 * path:
 *  /algorithm/:
 *    get:
 *      summary: Gets available algorithms user can choose from
 *      description: >
 *        Frontend sends request, server returns contents of wdl-scripts folder
 *      responses:
 *        '200':
 *          description: Ok, returning algorithms.
 *          content:
 *            application/json:
 *              schema:
 *                name: algorithm_array
 *                type: array
 *                items:
 *                  name: algorithm_name
 *                  type: string
 *                  example: StrainEst
 *                example: [ StrainEst ]
 *        '500':
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example : Internal server error
 */
router.get('/', (req, res) => {
  try {
    const items = fs.readdirSync('./algorithm/wdl-scripts');
    const algorithms = items.map((item) => item.substr(0, item.indexOf('.')));
    res.status(HttpStatus.OK).json(algorithms);
  } catch (e) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
  }
});

/**
 * @swagger
 * path:
 *  /algorithm/:algorithmName:/species:
 *    get:
 *      summary: Provides the available reference species for a given algorithm.
 *      description: >
 *        Frontend sends request, server returns names of supported species (with available .nwk phylotrees)
 *      parameters:
 *        - name : algorithmName
 *          in: req.params.algorithm
 *          type : string
 *      responses:
 *        '200':
 *          description: Ok, returning species.
 *          content:
 *            application/json:
 *              schema:
 *                name: species_array
 *                type: array
 *                items:
 *                  name: species_name
 *                  type: string
 *                  example: ecoli
 *                example: [ ecoli ]
 *        '404':
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example : Not found error
 */
router.get('/:algorithm/species', (req, res) => {
  try {
    const species = require(`../algorithm/${req.params.algorithm}/species/${req.params.algorithm}.json`);
    res.status(HttpStatus.OK).json(species);
  } catch (e) {
    res.status(HttpStatus.NOT_FOUND).end();
  }
});

module.exports = router;
