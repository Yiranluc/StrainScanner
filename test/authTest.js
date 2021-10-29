const server = require('../backend/app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const HttpStatus = require('http-status-codes');

const nock = require('nock');
const sinon = require('sinon');
const { google } = require('googleapis');
const auth = google.auth;
const googleUtil = require('../backend/util/google');
const usersService = require('../backend/util/users');
const usersModel = require('../backend/models/User');
const database = require('../backend/util/databaseConnections');

chai.use(chaiHttp);
chai.should();

describe('Auth Test POST', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('Success', () => {
    it('should return status code 200 OK', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email444@test-email.com'
            }
          });
        },
        getToken: async () => {
          return Promise.resolve({
            tokens: {
              id_token: 'token999',
              refresh_token: 'random-refresh-token2'
            }
          });
        },
        setCredentials: async () => {
          return Promise.resolve({
            refresh_token: 'random-refresh-token2'
          });
        },
        request: async () => {
          return Promise.resolve({
            data: null
          });
        }
      });

      process.env.PROJECT_ID = 'abc';

      sandbox.stub(database, 'databaseConnect');
      sandbox.stub(usersModel, 'findOne').returns({
        email: 'email444@test-email.com',
        token: 'random-refresh-token2'
      });
      sandbox.stub(usersService, 'getToken').returns({
        token: 'random-refresh-token2',
        status: HttpStatus.OK,
        message: 'OK'
      });
      sandbox.stub(usersModel, 'findOneAndUpdate').returns({
        email: 'email444@test-email.com',
        token: 'random-refresh-token2'
      });

      const res = await chai.request(server)
        .post('/google-auth')
        .send({ authCode: 'authCode123' });
      res.should.have.status(HttpStatus.OK);
      res.body.id_token.should.be.equal('token999');

      delete process.env.PROJECT_ID;
    });
  });

  describe('Error auth', () => {
    it('should return status code 401 UNAUTHORIZED', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email555@test-email.com'
            }
          });
        },
        getToken: async () => {
          return Promise.resolve({
            tokens: {
              id_token: 'token888'
            }
          });
        },
        setCredentials: async () => {
          return Promise.resolve({
            refresh_token: 'random-refresh-token3'
          });
        }
      });

      sandbox.stub(googleUtil, 'createBucket').returns(null);
      sandbox.stub(database, 'databaseConnect');
      sandbox.stub(usersModel, 'findOne').returns({
        email: 'email555@test-email.com',
        token: 'random-refresh-token3'
      });

      sandbox.stub(usersModel, 'findOneAndUpdate').returns({
        email: 'email555@test-email.com',
        token: 'random-refresh-token3'
      });

      const res = await chai.request(server)
        .post('/google-auth')
        .send({ authCode: 'authCode12345' });
      res.should.have.status(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Database Error', () => {
    it('error with database should return status code 503 SERVICE_UNAVAILABLE', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email4449@test-email.com'
            }
          });
        },
        getToken: async () => {
          return Promise.resolve({
            tokens: {
              id_token: 'token9999',
              refresh_token: 'random-refresh-token9'
            }
          });
        },
        setCredentials: async () => {
          return Promise.resolve({
            refresh_token: 'random-refresh-token2'
          });
        },
        request: async () => {
          return Promise.resolve({
            data: null
          });
        }
      });

      sandbox.stub(database, 'databaseConnect');
      sandbox.stub(usersModel, 'findOne').throws();
      sandbox.stub(usersService, 'getToken').throws();
      sandbox.stub(usersModel, 'findOneAndUpdate').throws();

      const res = await chai.request(server)
        .post('/google-auth')
        .send({ authCode: 'authCode1234' });
      res.should.have.status(HttpStatus.SERVICE_UNAVAILABLE);
    });
  });

  describe('Post Error Invalid Credentials', () => {
    it('should return status code 401', (done) => {
      chai.request(server)
        .post('/google-auth')
        .send('authCode', 'abcd123')
        .end((err, res) => {
          res.should.have.status(HttpStatus.UNAUTHORIZED);
          done();
        });
    });
  });

  describe('Post Auth No authCode', () => {
    it('should return status code 400 Bad Request', (done) => {
      chai.request(server)
        .post('/google-auth')
        .end((err, res) => {
          res.should.have.status(HttpStatus.BAD_REQUEST);
          done();
        });
    });
  });
});

describe('Auth Test GET', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('Success', () => {
    it('should return status code 200 OK alongside the payload', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email555@test-email.com'
            }
          });
        }
      });

      const res = await chai.request(server)
        .get('/google-auth')
        .set('Authorization', 'Bearer random-token123');
      res.should.have.status(HttpStatus.OK);
      res.body.should.have.property('email', 'email555@test-email.com');
    });
  });

  describe('Get Error Invalid Credentials', () => {
    it('should return status code 401', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.reject();
        }
      });

      chai.request(server)
        .get('/google-auth')
        .set('Authorization', 'Bearer 125bbdavn3')
        .end((err, res) => {
          res.should.have.status(HttpStatus.UNAUTHORIZED);
        });
    });
  });

  describe('Get Error No Id Token', () => {
    it('should return status code 401', (done) => {
      chai.request(server)
        .get('/google-auth')
        .end((err, res) => {
          res.should.have.status(HttpStatus.UNAUTHORIZED);
          done();
        });
    });
  });
});
