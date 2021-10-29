const chai = require('chai');
const HttpStatus = require('http-status-codes');
const nock = require('nock');

chai.should();


describe('Auth Setup', () => {
  // System under test
  const { setupAuth } = require('../backend/util/google');
  describe('Type Test', () => {
    it('should return an OAuth2 client', (done) => {
      const oAuth2Client = setupAuth();
      oAuth2Client.should.be.an('object').that.has.property('credentials');
      done();
    });
  });
});

describe('Bucket', () => {
  // To avoid leaking state
  afterEach(() => {
    nock.cleanAll();
  });
  // Helpers
  const { setupAuth } = require('../backend/util/google');
  const oAuth2Client = setupAuth();
  // System under test
  const { createBucket } = require('../backend/util/google');
  describe('Create Conflict', () => {
    it('should be void and not throw when bucket exists', async () => {
      return new Promise(async (resolve, reject) => {
        try {
          // Set up mock credentials
          oAuth2Client.setCredentials({ access_token: 'a' });
          // Mock Google API response
          const conflict = nock('https://storage.googleapis.com/storage/v1')
            .post('/b?project=1')
            .reply(HttpStatus.CONFLICT);

          // Should be void and not throw
          const res = await createBucket('1', oAuth2Client);
          chai.expect(res).to.eql(undefined);
          resolve();
        } catch (e) {
          // Something was thrown, the test should fail
          console.log(e);
          reject();
        }
      });
    });
  });
  describe('Another Error', () => {
    it('should throw an error when it is not a conflict', async () => {
      return new Promise(async (resolve, reject) => {
        try {
          // Set up mock credentials
          oAuth2Client.setCredentials({ access_token: 'a' });
          // Mock Google API response
          const conflict = nock('https://storage.googleapis.com/storage/v1')
            .post('/b?project=1')
            .reply(HttpStatus.NOT_FOUND);

          // Should throw
          await createBucket('1', oAuth2Client);
          reject();
        } catch (e) {
          // Error was thrown, test should pass
          resolve();
        }
      });
    });
  });
});
