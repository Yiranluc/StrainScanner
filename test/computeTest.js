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
const cromwell = require('../backend/util/cromwellUtil');
const fs = require('fs');

chai.use(chaiHttp);
chai.should();

describe('Compute Test', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  describe('Cromwell Error', () => {
    it('should return status code 500 INTERNAL_SERVER_ERROR', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email333@test-email.com'
            }
          });
        },
        setCredentials: async () => {
          return Promise.resolve({
            refresh_token: 'random-refresh-token'
          });
        },
        credentials: {
          refresh_token: 'random-refresh-token'
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

      // Mock Google API response for creating bucket
      const conflict = nock('https://storage.googleapis.com/storage/v1')
        .post('/b?project=1')
        .reply(HttpStatus.CONFLICT);

      process.env.PROJECT_ID = 'abc';

      const res = await chai.request(server)
        .post('/google-compute')
        .set('Authorization', 'Bearer a');
      res.should.have.status(HttpStatus.INTERNAL_SERVER_ERROR);

      delete process.env.PROJECT_ID;
    });
  });

  describe('Database Error (Incorrect Model in Database workflows is undefined)', () => {
    it('should return status code 500 INTERNAL_SERVER_ERROR', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email333@test-email.com'
            }
          });
        },
        setCredentials: async () => {
          return Promise.resolve({
            refresh_token: 'random-refresh-token'
          });
        },
        credentials: {
          refresh_token: 'random-refresh-token'
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

      sandbox.stub(database, 'databaseConnect');
      sandbox.stub(fs, 'createReadStream').returns('a');
      sandbox.stub(fs, 'writeFileSync').returns(null);
      sandbox.stub(cromwell, 'getCromwell').returns(null);

      const mock = nock('http://localhost:8000/api/workflows/v1')
        .post(/.*/)
        .reply(HttpStatus.CREATED, { id: 'workflowuuidRandom' });

      // Mock Google API response for creating bucket
      const conflict = nock('https://storage.googleapis.com/storage/v1')
        .post('/b?project=1')
        .reply(HttpStatus.CONFLICT);

      process.env.PROJECT_ID = 'abc';

      const res = await chai.request(server)
        .post('/google-compute')
        .set('Authorization', 'Bearer a')
        .send({
          algorithm: 'algo',
          inputs: 'inputs',
          refresh_token: 'random-refresh-token'
        });
      res.should.have.status(HttpStatus.INTERNAL_SERVER_ERROR);

      delete process.env.PROJECT_ID;
    });
  });

  describe('Success', () => {
    it('should return status code 201 CREATED', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email444@test-email.com'
            }
          });
        },
        setCredentials: async () => {
          return Promise.resolve({
            refresh_token: 'random-refresh-token2'
          });
        },
        credentials: {
          refresh_token: 'random-refresh-token2'
        },
        request: async () => {
          return Promise.resolve({
            data: null
          });
        }
      });

      sandbox.stub(usersModel, 'findOne').returns({
        email: 'email444@test-email.com',
        refresh_token: 'random-refresh-token2',
        workflows: []
      });

      sandbox.stub(database, 'databaseConnect');
      sandbox.stub(usersModel, 'updateOne').returns(null);
      sandbox.stub(fs, 'createReadStream').returns('a');
      sandbox.stub(fs, 'writeFileSync').returns(null);
      sandbox.stub(cromwell, 'getCromwell').returns(null);

      const mock = nock('http://localhost:8000/api/workflows/v1')
        .post(/.*/)
        .reply(HttpStatus.CREATED, { id: 'workflowuuidRandom2' });

      // Mock Google API response for creating bucket
      const conflict = nock('https://storage.googleapis.com/storage/v1')
        .post('/b?project=1')
        .reply(HttpStatus.CONFLICT);

      process.env.PROJECT_ID = 'abc';

      const res = await chai.request(server)
        .post('/google-compute')
        .set('Authorization', 'Bearer a')
        .send({
          algorithm: 'algo2',
          inputs: 'inputs2',
          refresh_token: 'random-refresh-token2'
        });
      res.should.have.status(HttpStatus.CREATED);

      delete process.env.PROJECT_ID;
    });
  });

  describe('Post Error No Refresh_Token', () => {
    it('should return status code 401 UNAUTHORIZED', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email444@test-email.com'
            }
          });
        },
        setCredentials: async () => {
          return Promise.resolve({
          });
        },
        credentials: {
        }
      });

      sandbox.stub(usersModel, 'findOne').returns({
        email: 'email444@test-email.com',
        workflows: []
      });

      sandbox.stub(database, 'databaseConnect');
      sandbox.stub(usersModel, 'updateOne').returns(null);

      const res = await chai.request(server)
          .post('/google-compute')
          .set('Authorization', 'Bearer a')
          .send({
            algorithm: 'algo2',
            inputs: 'inputs2'
          });
      res.should.have.status(HttpStatus.UNAUTHORIZED);
    });
  });
});

describe('Post Error No id_token', () => {
  it('should return status code 401 UNAUTHORIZED', async () => {
    const res = await chai.request(server)
      .post('/google-compute')
      .send({
        algorithm: 'algo2',
        inputs: 'inputs2',
        refresh_token: 'random-refresh-token'
      });
    res.should.have.status(HttpStatus.UNAUTHORIZED);
  });
});
