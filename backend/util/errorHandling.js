const HttpStatus = require('http-status-codes');

/**
 * Handles errors from Cromwell. Ends the response.
 *
 * @param res response to frontend
 * @param error that is received
 */
const handle = (res, error) => {
  const code = error.response.status;
  switch (code) {
    case 403:
      res.status(HttpStatus.FORBIDDEN).end();
      break;
    case 404:
      res.status(HttpStatus.NOT_FOUND).end();
      break;
    default:
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
      break;
  }
};

module.exports = { handle };
