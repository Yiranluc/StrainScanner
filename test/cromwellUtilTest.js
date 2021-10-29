const chai = require('chai');
const HttpStatus = require('http-status-codes');
const nock = require('nock');

chai.should();

describe('Cromwell Connection', () => {
  // System under test
  const { getCromwell } = require('../backend/util/cromwellUtil');
  it('should return an axios instance pointing to localhost:8000', async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const cromwell = await getCromwell();
        cromwell.defaults.baseURL.should.equal('http://localhost:8000/');
        resolve();
      } catch (e) {
        // Something was thrown, the test should fail
        console.log(e);
        reject();
      }
    });
  });
});
