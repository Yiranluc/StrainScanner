const chai = require('chai');
const chaiHttp = require('chai-http');
const HttpStatus = require('http-status-codes');
const sinon = require('sinon');
const assert = require('assert');
const database = require('../backend/util/databaseConnections');

const usersModel = require('../backend/models/User');
const usersService = require('../backend/util/users');

chai.use(chaiHttp);
chai.should();

describe('Database Tests', () => {
  let getUserStub;
  let updateOneStub;
  let findOneAndUpdateStub;
  let databaseStub;
  let databaseDisconnectStub;
  let saveStub;

  const response = {
    _id: 'randomid123',
    email: 'email19',
    workflows: [{
      workflowId: 'abc999123',
      submitted: null,
      finished: null,
      algorithm: 'strainest',
      species: 'ecoli',
      projectId: 'project-id-123-abcd',
      sampleName: 'abc123',
      single: true,
      status: 'Submitted'
    }],
    refresh_token: 'tokenrandom'
  };

  beforeEach(function () {
    getUserStub = sinon.stub(usersModel, 'findOne');
    updateOneStub = sinon.stub(usersModel, 'updateOne');
    findOneAndUpdateStub = sinon.stub(usersModel, 'findOneAndUpdate');
    databaseStub = sinon.stub(database, 'databaseConnect');
    databaseDisconnectStub = sinon.stub(database, 'databaseDisconnect');
    saveStub = sinon.stub(usersModel.prototype, 'save');
  });

  afterEach(function () {
    getUserStub.restore();
    updateOneStub.restore();
    findOneAndUpdateStub.restore();
    databaseStub.restore();
    databaseDisconnectStub.restore();
    saveStub.restore();
  });

  describe('SaveUser Test: Add Existing User', () => {
    it('Since the user exists it should return 409 CONFLICT', async () => {
      const response = {
        _id: 1,
        email: 'email2',
        workflows: [],
        __v: 0
      };

      getUserStub.returns(Promise.resolve(response));

      const result = await usersService.saveUser('email2');
      chai.expect(result.status).to.equal(HttpStatus.CONFLICT);
      assert(getUserStub.calledOnce);
    });
  });

  describe('SaveUser Test: Success', () => {
    it('Since the user is created successfully it should return 201 CREATED', async () => {
      getUserStub.returns(Promise.resolve(null));
      databaseDisconnectStub.returns(null);
      saveStub.returns(null);

      const result = await usersService.saveUser('email0');
      chai.expect(result.status).to.equal(HttpStatus.CREATED);
      assert(getUserStub.calledOnce);
    });
  });

  describe('SaveUser Test: Server Error', () => {
    it('Since connection cannot be made it should return 503 SERVICE_UNAVAILABLE', async () => {
      const response = {
        _id: 1,
        email: 'email2',
        workflows: [],
        __v: 0
      };

      getUserStub.throws();

      const result = await usersService.saveUser('email3');

      chai.expect(result.status).to.equal(HttpStatus.SERVICE_UNAVAILABLE);
      assert(getUserStub.calledOnce);
    });
  });

  describe('addWorkflow Test: User Not Found', () => {
    it('Since there is no user associated with that email, should return 404 NOT_FOUND', async () => {
      const response = null;

      getUserStub.returns(response);

      const result = await usersService.addWorkflow('email4', '123');

      chai.expect(result.status).to.equal(HttpStatus.NOT_FOUND);
      assert(getUserStub.calledOnce);
    });
  });

  describe('addWorkflow Test: Add Workflow That Already Exists', () => {
    it('Since workflow id matches it should return 409 CONFLICT', async () => {
      const workflow = {
        workflowId: '123',
        submitted: null,
        finished: null,
        algorithm: 'strainest',
        species: 'ecoli',
        referenceDb: null
      };

      const response = {
        _id: '12345',
        email: 'email5',
        workflows: [{
          workflowId: '123',
          submitted: null,
          finished: null,
          algorithm: 'strainest',
          species: 'ecoli',
          referenceDb: null
        }],
        __v: 0
      };

      getUserStub.returns(response);

      const result = await usersService.addWorkflow('email5', workflow);

      chai.expect(result.status).to.equal(HttpStatus.CONFLICT);
      assert(getUserStub.calledOnce);
    });
  });

  describe('addWorkflow Test: Server Error', () => {
    it('Since connection is lost it should return 503 SERVICE_UNAVAILABLE', async () => {
      const workflow = {
        workflowId: '6',
        submitted: null,
        finished: null,
        algorithm: 'strainest',
        species: 'ecoli',
        referenceDb: null
      };

      const response = {
        _id: '12345',
        email: 'e',
        workflows: [{
          workflowId: '123',
          submitted: null,
          finished: null,
          algorithm: 'strainest',
          species: 'ecoli',
          referenceDb: null
        }],
        __v: 0
      };

      getUserStub.returns(response);
      updateOneStub.throws();

      const result = await usersService.addWorkflow('e', workflow);

      chai.expect(result.status).to.equal(HttpStatus.SERVICE_UNAVAILABLE);
      assert(getUserStub.calledOnce);
      assert(updateOneStub.calledOnce);
    });
  });

  describe('addWorkflow Test: Another Server Error', () => {
    it('Since connection cannot be made it should return 503 SERVICE_UNAVAILABLE', async () => {
      getUserStub.throws();

      const result = await usersService.addWorkflow('e', null);

      chai.expect(result.status).to.equal(HttpStatus.SERVICE_UNAVAILABLE);
      assert(getUserStub.calledOnce);
    });
  });

  describe('addWorkflow Test: Successfully Add Workflow', () => {
    it('Since this is correct behaviour to add a workflow it should return 200 OK', async () => {
      const workflow = {
        workflowId: '777',
        submitted: null,
        finished: null,
        algorithm: 'strainest',
        species: 'ecoli',
        referenceDb: null
      };

      const response = {
        _id: '12345',
        email: 'email6',
        workflows: [{
          workflowId: '123',
          submitted: null,
          finished: null,
          algorithm: 'strainest',
          species: 'ecoli',
          referenceDb: null
        }],
        __v: 0
      };

      getUserStub.returns(response);
      updateOneStub.returns(null);

      const result = await usersService.addWorkflow('email6', workflow);

      chai.expect(result.status).to.equal(HttpStatus.OK);
      assert(getUserStub.calledOnce);
      assert(updateOneStub.calledOnce);
    });
  });

  describe('addWorkflow Test: Success Adding Second Workflow', () => {
    it('Since the workflows are different and pre-conditions are met it should return 200 OK', async () => {
      const workflow = {
        workflowId: '555',
        submitted: null,
        finished: null,
        algorithm: 'strainest',
        species: 'ecoli',
        referenceDb: null
      };

      const response = {
        _id: '12345',
        email: 'email66',
        workflows: [],
        __v: 0
      };

      getUserStub.returns(response);
      updateOneStub.returns(null);

      const result = await usersService.addWorkflow('email66', workflow);

      chai.expect(result.status).to.equal(HttpStatus.OK);
      assert(getUserStub.calledOnce);
      assert(updateOneStub.calledOnce);
    });
  });

  describe('updateRefreshToken Test: Server Error', () => {
    it('Since the connection cannot be made it should return 503 SERVICE_UNAVAILABLE', async () => {
      findOneAndUpdateStub.throws();

      const result = await usersService.updateRefreshToken('email7', null);

      chai.expect(result.status).to.equal(HttpStatus.SERVICE_UNAVAILABLE);
      assert(findOneAndUpdateStub.calledOnce);
    });
  });

  describe('updateRefreshToken Test: Successfully Update RefreshToken', () => {
    it('Since there exists a refreshToken it can be updated and it should return 200 OK', async () => {
      const response = {
        placeholder: 'success'
      };

      findOneAndUpdateStub.returns(response);

      const result = await usersService.updateRefreshToken('email8', null);

      chai.expect(result.status).to.equal(HttpStatus.OK);
      assert(findOneAndUpdateStub.calledOnce);
    });
  });

  describe('updateRefreshToken Test: Refresh Token Not Found', () => {
    it('Since there is no refreshToken to update it should return 404 NOT_FOUND', async () => {
      const response = null;

      findOneAndUpdateStub.returns(response);

      const result = await usersService.updateRefreshToken('email9', null);

      chai.expect(result.status).to.equal(HttpStatus.NOT_FOUND);
      assert(findOneAndUpdateStub.calledOnce);
    });
  });

  describe('getToken Test: User Not Found In Database', () => {
    it('Since there is no user with the associated email to get the refreshToken, it should return 404 NOT_FOUND', async () => {
      const response = null;

      getUserStub.returns(response);

      const result = await usersService.getToken('email10', null);

      chai.expect(result.status).to.equal(HttpStatus.NOT_FOUND);
      assert(getUserStub.calledOnce);
    });
  });

  describe('getToken Test: Successfully Return the RefreshToken', () => {
    it('Since a user with the given email is found with a refreshToken it should return 200 OK alongside the refresh token', async () => {
      const response = {
        _id: '12345',
        email: 'email11',
        workflows: [],
        __v: 0,
        refresh_token: 'token123'
      };

      getUserStub.returns(response);

      const result = await usersService.getToken('email11');

      chai.expect(result.status).to.equal(HttpStatus.OK);
      assert(result.token === response.refresh_token);
      assert(getUserStub.calledOnce);
    });
  });

  describe('getToken Test: Server Error', () => {
    it('Since a connection cannot be made it should return 503 SERVICE_UNAVAILABLE', async () => {
      getUserStub.throws();

      const result = await usersService.getToken('email12');

      chai.expect(result.status).to.equal(HttpStatus.SERVICE_UNAVAILABLE);
      assert(getUserStub.calledOnce);
    });
  });

  describe('getWorkflows Test: Successfully Return the list of workflows', () => {
    it('Since a user with the given email is found it should return 200 OK alongside the list of workflows', async () => {
      const response = {
        _id: '11111',
        email: 'email13',
        workflows: [{
          workflowId: '123abcd',
          submitted: null,
          finished: null,
          algorithm: 'strainest',
          species: 'ecoli',
          projectId: 'project-id-123',
          sampleName: 'SRR123',
          single: true,
          status: 'Submitted'
        }],
        refresh_token: 'token123token'
      };

      getUserStub.returns(response);

      const result = await usersService.getWorkflows('email13');

      chai.expect(result.status).to.equal(HttpStatus.OK);
      assert(result.workflows === response.workflows);
      assert(result.message === 'OK');
      assert(getUserStub.calledOnce);
    });
  });

  describe('getWorkflows Test: Successfully Return the list of empty workflows', () => {
    it('Since a user with the given email is found it should return 200 OK alongside the empty list of workflows', async () => {
      const response = {
        _id: '11111',
        email: 'email14',
        workflows: null,
        refresh_token: 'token123token'
      };

      getUserStub.returns(response);

      const result = await usersService.getWorkflows('email14');

      chai.expect(result.status).to.equal(HttpStatus.OK);
      chai.expect(result.workflows).to.be.empty;
      assert(result.message === 'OK');
      assert(getUserStub.calledOnce);
    });
  });

  describe('getWorkflows Test:  User Not Found In Database', () => {
    it('Since a user with the given email is not found it should return 404 NOT_FOUND', async () => {
      getUserStub.returns(null);

      const result = await usersService.getWorkflows('email15');

      chai.expect(result.status).to.equal(HttpStatus.NOT_FOUND);
      assert(result.message === 'No such user');
      assert(getUserStub.calledOnce);
    });
  });

  describe('getWorkflows Test: Server Error', () => {
    it('Since connection to server cannot be made it should return 503 SERVICE_UNAVAILABLE', async () => {
      getUserStub.throws();

      const result = await usersService.getWorkflows('email16');

      chai.expect(result.status).to.equal(HttpStatus.SERVICE_UNAVAILABLE);
      assert(getUserStub.calledOnce);
    });
  });

  describe('getStatus Test: Successfully return the status of the workflow', () => {
    it('Since a user with the given email is found it should return 200 OK alongside the status of the workflow', async () => {
      getUserStub.returns(response);

      const result = await usersService.getStatus('email19', 'abc999123');

      chai.expect(result.status).to.equal(HttpStatus.OK);
      assert(result.workflowStatus === response.workflows[0].status);
      assert(result.message === 'Success');
      assert(getUserStub.calledOnce);
    });
  });

  describe('getStatus Test: User Not Found', () => {
    it('Since a user with the given email is not found it should return 404 NOT_FOUND', async () => {
      getUserStub.returns(null);

      const result = await usersService.getStatus('email18', 'abcd1234z9');

      chai.expect(result.status).to.equal(HttpStatus.NOT_FOUND);
      assert(result.message === 'User with given email not found');
      assert(getUserStub.calledOnce);
    });
  });

  describe('getStatus Test: Workflow Not Found', () => {
    it('Since workflow with given id is not found it should return 404 NOT_FOUND', async () => {
      getUserStub.returns(response);

      const result = await usersService.getStatus('email19', '111');

      chai.expect(result.status).to.equal(HttpStatus.NOT_FOUND);
      assert(result.message === 'Workflow with given workflowID not found');
      assert(getUserStub.calledOnce);
    });
  });

  describe('getStatus Test: Server Error', () => {
    it('Since a connection cannot be made it should return 503 SERVICE_UNAVAILABLE', async () => {
      getUserStub.throws();

      const result = await usersService.getStatus('email20', 'randomwokrflowid123');

      chai.expect(result.status).to.equal(HttpStatus.SERVICE_UNAVAILABLE);
      assert(getUserStub.calledOnce);
    });
  });

  describe('getWorkflows Test: Successfully Update the status of Workflow', () => {
    it('Since a user with the given email, and workflowId is found it should return 200 OK', async () => {
      const response = {
        _id: 'idabc123',
        email: 'email21',
        workflows: [{
          workflowId: 'random123id',
          submitted: null,
          finished: null,
          algorithm: 'strainest',
          species: 'ecoli',
          projectId: 'project-id-123456789',
          sampleName: 'samplename',
          single: true,
          status: 'Submitted'
        }],
        refresh_token: 'tokenabc123'
      };

      findOneAndUpdateStub.returns(response);

      const result = await usersService.updateStatus('email21', 'random123id', 'Running');

      chai.expect(result.status).to.equal(HttpStatus.OK);
      assert(result.message === 'Workflow status updated successfully!');
      assert(findOneAndUpdateStub.calledOnce);
    });
  });

  describe('getWorkflows Test: WorkflowId not Found', () => {
    it('Since the given workflowId is not found it should return 404 NOT_FOUND', async () => {
      findOneAndUpdateStub.returns(null);

      const result = await usersService.updateStatus('email22', 'idrandom', 'Running');

      chai.expect(result.status).to.equal(HttpStatus.NOT_FOUND);
      assert(result.message === 'No user with given email, or workflowId found');
      assert(findOneAndUpdateStub.calledOnce);
    });
  });

  describe('getWorkflows Test: Server Error', () => {
    it('Since connection cannot be made it should return 503 SERVICE_UNAVAILABLE', async () => {
      findOneAndUpdateStub.throws();

      const result = await usersService.updateStatus('email23', 'randomworkflow9999', 'Failed');

      chai.expect(result.status).to.equal(HttpStatus.SERVICE_UNAVAILABLE);
      assert(findOneAndUpdateStub.calledOnce);
    });
  });
});
