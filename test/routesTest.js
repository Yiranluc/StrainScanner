const server = require('../backend/app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const HttpStatus = require('http-status-codes');
const { reject } = require('underscore');

chai.use(chaiHttp);
chai.should();
const expect = chai.expect;

describe('Algorithm Tests', () => {

  /**
   * Tests the index.
   * Get request to root.
   * Expect to return 200 OK as response.
   */
  describe('Get index', () => {
    it('should connect to the server root', (done) => {
      chai.request(server).get('/')
        .then((res) => {
          expect(res).to.have.status(HttpStatus.OK);
          done();
        })
        .catch((err) => {
          console.log(err);
          reject();
        });
    });
  });

  /**
   * Tests the root for a non-existent directory.
   * Get request to '/a'.
   * Expect to return 404 NOT_FOUND as response.
   */
  describe('Get Non-Existent', () => {
    it('should return 404 NOT_FOUND', (done) => {
      chai.request(server)
        .get('/a')
        .end((err, res) => {
          res.should.have.status(HttpStatus.NOT_FOUND);
          done();
        });
    });
  });

  /**
   * Tests the root for non-existent post request.
   * Post request to '/'.
   * Expect to return 405 METHOD_NOT_ALLOWED as response.
   */
  describe('Post Error', () => {
    it('should return status code 405 METHOD_NOT_ALLOWED', (done) => {
      chai.request(server)
        .post('/')
        .end((err, res) => {
          res.should.have.status(HttpStatus.METHOD_NOT_ALLOWED);
          done();
        });
    });
  });

  /**
   * Tests the root for a non-existent directory without development environment.
   * Get request to '/b'.
   * Expect to return 404 NOT_FOUND as response.
   */
  describe('Get Non-Existent', () => {
    it('should return 404 NOT_FOUND', (done) => {
      server.set('env', 'non-dev');
      chai.request(server)
        .get('/a')
        .end((err, res) => {
          res.should.have.status(HttpStatus.NOT_FOUND);
          done();
        });
    });
  });
});
