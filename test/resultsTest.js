const server = require('../backend/app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const HttpStatus = require('http-status-codes');

const nock = require('nock');
const sinon = require('sinon');
const { google } = require('googleapis');
const auth = google.auth;
const googleUtil = require('../backend/util/google');
const usersModel = require('../backend/models/User');
const database = require('../backend/util/databaseConnections');
const resultsUtil = require('../backend/util/resultsUtil');

chai.use(chaiHttp);
chai.should();

describe('Results', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('Get Results Test', () => {
    it('Get Results of Workflows Success should return 200 OK alongside the abundances', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email222@test-email.com'
            }
          });
        },
        setCredentials: async () => {
          return Promise.resolve({
            refresh_token: 'token'
          });
        },
        credentials: {
          refresh_token: 'token'
        },
        request: async () => {
          return Promise.resolve({
            data: 'OTU\treads.sorted.bam\nGCF_0.1_TEST_genomic.fna\t0.0004\n'
          });
        }
      });

      sandbox.stub(usersModel, 'findOne').returns({
        email: 'email333@test-email.com',
        refresh_token: 'random-refresh-token'
      });
      sandbox.stub(googleUtil, 'attachRefreshToken').returns(null);
      sandbox.stub(database, 'databaseConnect');

      const mock = nock('https://storage.googleapis.com/storage/v1')
        .get('/b/b1/o/StrainEst%2Fw1%2Ff1%2Foutputdir%2Fabund.txt?alt=media')
        .reply(HttpStatus.OK);

      const res = await chai.request(server)
        .get('/results/bucket/b1/algorithm/StrainEst/workflow/w1/folder/f1/species/s1')
        .set('Authorization', 'Bearer a');
      res.should.have.status(HttpStatus.OK);
      res.body.should.have.property('TEST', 0.0004);
    });
  });

  describe('Get Results Test Error', () => {
    it('Get Results of Workflows Error should return 500 INTERNAL_SERVER_ERROR', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email222@test-email.com'
            }
          });
        },
        setCredentials: async () => {
          return Promise.resolve({
            refresh_token: 'token'
          });
        },
        credentials: {
          refresh_token: 'token'
        },
        request: async () => {
          return Promise.resolve({
            data: null
          });
        }
      });

      sandbox.stub(usersModel, 'findOne').returns({
        email: 'email333@test-email.com',
        refresh_token: 'random-refresh-token'
      });
      sandbox.stub(googleUtil, 'attachRefreshToken').returns(null);
      sandbox.stub(database, 'databaseConnect');

      const mock = nock('https://storage.googleapis.com/storage/v1')
        .get('/b/b1/o/StrainEst%2Fw1%2Ff1%2Foutputdir%2Fabund.txt?alt=media')
        .reply();

      const res = await chai.request(server)
        .get('/results/bucket/b1/algorithm/StrainEst/workflow/w1/folder/f1/species/s1')
        .set('Authorization', 'Bearer a');
      res.should.have.status(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Get Results Test Error', () => {
    it('Get Results no refresh token should return 401 UNAUTHORIZED', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email222@test-email.com'
            }
          });
        },
        setCredentials: async () => {
          return Promise.resolve({
          });
        },
        credentials: {
        },
        request: async () => {
          return Promise.resolve({
            data: null
          });
        }
      });

      sandbox.stub(usersModel, 'findOne').returns({
        email: 'email333@test-email.com'
      });
      sandbox.stub(googleUtil, 'attachRefreshToken').returns(null);
      sandbox.stub(database, 'databaseConnect');

      const res = await chai.request(server)
        .get('/results/bucket/b1/algorithm/a1/workflow/w1/folder/f1/species/s1')
        .set('Authorization', 'Bearer a');
      res.should.have.status(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Get Results Test Error', () => {
    it('Get Results, object that doesnt exist in Google storage should return 404 NOT_FOUND', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email3339@test-email.com'
            }
          });
        },
        setCredentials: async () => {
          return Promise.resolve({
            refresh_token: 'token'
          });
        },
        credentials: {
          refresh_token: 'token'
        },
        request: async () => {
          return Promise.reject({
            code: '404'
          });
        }
      });

      sandbox.stub(usersModel, 'findOne').returns({
        email: 'email3339@test-email.com',
        refresh_token: 'random-refresh-token9'
      });
      sandbox.stub(googleUtil, 'attachRefreshToken').returns(null);
      sandbox.stub(database, 'databaseConnect');

      const mock = nock('https://storage.googleapis.com/storage/v1')
        .get(/.*/)
        .replyWithError({ code: '404' });

      const res = await chai.request(server)
        .get('/results/bucket/b1/algorithm/StrainEst/workflow/w1/folder/f1/species/s1')
        .set('Authorization', 'Bearer a');
      res.should.have.status(HttpStatus.NOT_FOUND);
    });
  });

  describe('Get Error Invalid Credentials', () => {
    it('Should return status code 401', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.reject();
        }
      });

      const res = await chai.request(server)
        .get('/results/bucket/b/algorithm/a/workflow/w/folder/f/species/s')
        .set('refresh_token', 'random-refresh-token');
      res.should.have.status(HttpStatus.UNAUTHORIZED);
    });
  });
});
