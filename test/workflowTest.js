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
const usersService = require('../backend/util/users');
const database = require('../backend/util/databaseConnections');

chai.use(chaiHttp);
chai.should();

describe('Workflows', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('Get Workflows Test', () => {
    it('Get List of Workflows Error without auth should return 401 UNAUTHORIZED', async () => {
      const res = await chai.request(server).get('/workflow')
        .set('Authorization', 'Bearer token123');
      res.should.have.status(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Get Workflows Test', () => {
    it('Get List of Workflows Error server error should return 500 INTERNAL_SERVER_ERROR', async () => {
      sandbox.stub(auth, 'OAuth2').throws();

      const res = await chai.request(server).get('/workflow')
        .set('Authorization', 'Bearer 123');
      res.should.have.status(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Get Workflows Test', () => {
    it('Get List of Workflows Error without payload does not contain email should return 500 INTERNAL_SERVER_ERROR', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: null
            }
          });
        }
      });

      const res = await chai.request(server).get('/workflow')
        .set('Authorization', 'Bearer token123');
      res.should.have.status(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Get Workflows Test', () => {
    it('Get List of Workflows Success should return list of workflows as well as 200 OK', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'email111@email.com'
            }
          });
        }
      });

      sandbox.stub(database, 'databaseConnect');
      sandbox.stub(usersModel, 'findOne').resolves({
        _id: 1,
        email: 'email111@email.com',
        workflows: [{
          _doc: {
            workflowId: 'id999',
            submitted: null,
            finished: null,
            algorithm: 'StrainEst',
            species: 'sepidermidis',
            projectId: 'random-project-test-123',
            sampleName: 'SRR492195',
            single: false,
            status: 'Succeeded'
          }
        }],
        __v: 0
      });

      const res = await chai.request(server).get('/workflow')
        .set('Authorization', 'Bearer bearertokenrandom');
      res.should.have.status(HttpStatus.OK);
      res.body[0].should.have.property('workflowId').equal('id999');
      res.body[0].should.have.property('status').equal('Succeeded');
      res.body[0].should.have.property('nwkTree');
    });
  });

  describe('Status', () => {
    it('Get status without Cromwell 200 OK', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'ok@example.com'
            }
          });
        }
      });
      sandbox.stub(database, 'databaseConnect');
      sandbox.stub(usersModel, 'findOne').resolves({
        _id: 1,
        email: 'email2',
        workflows: [{
          workflowId: '1234',
          status: 'running'
        }],
        __v: 0
      });
      const res = await chai.request(server).get('/workflow/1234/status')
        .set('Authorization', 'Bearer foobar');
      res.should.have.status(HttpStatus.OK);
      res.body.should.equal('running');
    });
    it('Bad weather test auth error should return 401 UNAUTHORIZED', async () => {
      return new Promise(async (resolve, reject) => {
        try {
          chai.request(server).get('/workflow/999/status')
            .end((err, res) => {
              res.should.have.status(HttpStatus.UNAUTHORIZED);
              resolve();
            });
        } catch (err) {
          // Error occured, test fails
          console.log(err);
          reject();
        }
      });
    });
  });

  describe('Status', () => {
    it('Get status error, no old status should return 404 NOT_FOUND', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'test@example.com'
            }
          });
        }
      });
      sandbox.stub(database, 'databaseConnect');
      sandbox.stub(usersModel, 'findOne').resolves({
        _id: 1,
        email: 'email2',
        workflows: [{
          workflowId: 'random123',
          status: null
        }],
        __v: 0
      });
      const res = await chai.request(server).get('/workflow/random123/status')
        .set('Authorization', 'Bearer token123');
      res.should.have.status(HttpStatus.NOT_FOUND);
    });
  });

  describe('Status', () => {
    it('Get status success, updated status is returned as well as 200 OK', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'test1@example.com'
            }
          });
        }
      });
      sandbox.stub(database, 'databaseConnect');
      sandbox.stub(usersModel, 'findOne').resolves({
        _id: 1,
        email: 'email3',
        workflows: [{
          workflowId: 'random123abc',
          status: 'Submitted'
        }],
        __v: 0
      });

      const mock = nock('http://localhost:8000/api/workflows/v1')
        .get('/random123abc/status')
        .reply(HttpStatus.OK, { id: 'random123abc', status: 'Running' });

      sandbox.stub(usersModel, 'findOneAndUpdate').resolves({
        status: 'Running'
      });

      sandbox.stub(usersService, 'updateStatus').resolves({
        status: 'Running'
      });

      const res = await chai.request(server).get('/workflow/random123abc/status')
        .set('Authorization', 'Bearer token123');
      res.should.have.status(HttpStatus.OK);
      res.body.should.equal('Running');
    });
  });

  describe('Status', () => {
    it('Get status error, error from database, return 500 INTERNAL_SERVER_ERROR ', async () => {
      sandbox.stub(auth, 'OAuth2').returns({
        verifyIdToken: async () => {
          return Promise.resolve({
            payload: {
              email: 'test1@example.com'
            }
          });
        }
      });
      sandbox.stub(database, 'databaseConnect');
      sandbox.stub(usersModel, 'findOne').resolves({
        _id: 1,
        email: 'email4',
        workflows: [{
          workflowId: 'random123abc1',
          status: 'Submitted'
        }],
        __v: 0
      });

      const mock = nock('http://localhost:8000/api/workflows/v1')
        .get('/random123abc1/status')
        .reply(HttpStatus.OK, { id: 'random123abc1', status: 'Running' });

      sandbox.stub(usersModel, 'findOneAndUpdate').throws();

      const res = await chai.request(server).get('/workflow/random123abc1/status')
        .set('Authorization', 'Bearer token12356');
      res.should.have.status(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Outputs', () => {
    it('Good weather test should return 200 OK', async () => {
      const mock = nock('http://localhost:8000/api/workflows/v1')
        .get('/abc/outputs')
        .reply(HttpStatus.OK, { id: '1234', outputs: {} });

      const res = await chai.request(server).get('/workflow/abc/outputs');
      res.should.have.status(HttpStatus.OK);
    });
  });
  it('Bad weather test should return 404 NOT_FOUND', async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const mock = nock('http://localhost:8000/api/workflows/v1')
          .get('/1/outputs')
          .reply(HttpStatus.NOT_FOUND);

        chai.request(server).get('/workflow/1/outputs')
          .end((err, res) => {
            res.should.have.status(HttpStatus.NOT_FOUND);
            resolve();
          });
      } catch (err) {
        // Error occured, test fails
        console.log(err);
        reject();
      }
    });
  });
  it('Another bad weather test should return 403 FORBIDDEN', async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const mock = nock('http://localhost:8000/api/workflows/v1')
          .get('/111/outputs')
          .reply(HttpStatus.FORBIDDEN);

        chai.request(server).get('/workflow/111/outputs')
          .end((err, res) => {
            res.should.have.status(HttpStatus.FORBIDDEN);
            resolve();
          });
      } catch (err) {
        // Error occured, test fails
        console.log(err);
        reject();
      }
    });
  });
  it('Another bad weather test should return 500 INTERNAL_SERVER_ERROR', async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const mock = nock('http://localhost:8000/api/workflows/v1')
          .get('/111222/outputs')
          .reply(HttpStatus.INTERNAL_SERVER_ERROR);

        chai.request(server).get('/workflow/111222/outputs')
          .end((err, res) => {
            res.should.have.status(HttpStatus.INTERNAL_SERVER_ERROR);
            resolve();
          });
      } catch (err) {
        // Error occured, test fails
        console.log(err);
        reject();
      }
    });
  });

  describe('Abort', () => {
    it('Good weather test should return 200 OK', async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const mock = nock('http://localhost:8000/api/workflows/v1')
            .post('/wf123/abort')
            .reply(HttpStatus.OK, 'aborting');

          chai.request(server).post('/workflow/abort')
            .send({ workflowId: 'wf123' })
            .end((err, res) => {
              res.body.should.equal('aborting');
              res.should.have.status(HttpStatus.OK);
              resolve();
            });
        } catch (err) {
          // Error occured, test fails
          console.log(err);
          reject();
        }
      });
    });
    it('Bad weather test should return 404 NOT_FOUND', async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const mock = nock('http://localhost:8000/api/workflows/v1')
            .post('/987/abort')
            .reply(HttpStatus.NOT_FOUND);

          chai.request(server).post('/workflow/abort')
            .send({ workflowId: '987' })
            .end((err, res) => {
              res.should.have.status(HttpStatus.NOT_FOUND);
              resolve();
            });
        } catch (err) {
          // Error occured, test fails
          console.log(err);
          reject();
        }
      });
    });
    it('Bad weather test should return 403 FORBIDDEN', async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const mock = nock('http://localhost:8000/api/workflows/v1')
            .post('/test123/abort')
            .reply(HttpStatus.FORBIDDEN);

          chai.request(server).post('/workflow/abort')
            .send({ workflowId: 'test123' })
            .end((err, res) => {
              res.should.have.status(HttpStatus.FORBIDDEN);
              resolve();
            });
        } catch (err) {
          // Error occured, test fails
          console.log(err);
          reject();
        }
      });
    });
    it('Bad weather test should return 500 INTERNAL_SERVER_ERROR', async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const mock = nock('http://localhost:8000/api/workflows/v1')
            .post('/test999/abort')
            .reply(HttpStatus.INTERNAL_SERVER_ERROR);

          chai.request(server).post('/workflow/abort')
            .send({ workflowId: 'test999' })
            .end((err, res) => {
              res.should.have.status(HttpStatus.INTERNAL_SERVER_ERROR);
              resolve();
            });
        } catch (err) {
          // Error occured, test fails
          console.log(err);
          reject();
        }
      });
    });
  });
});
