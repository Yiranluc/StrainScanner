const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'StrainScanner backend',
      version: '1.0.0',
      description:
          'Web application for executing WDL workflows on metagenomic samples.',
      license: {
        name: 'Apache 2.0',
        url: 'https://choosealicense.com/licenses/apache-2.0/'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Google id_token'
        }
      }
    }
  },
  apis: [
    './routes/algorithm.js',
    './routes/google-auth.js',
    './routes/google-compute.js',
    './routes/results.js',
    './routes/workflow.js'
  ]
};
const specs = swaggerJsdoc(options);

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true
  })
);

module.exports = router;
