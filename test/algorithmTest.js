const server = require('../backend/app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const HttpStatus = require('http-status-codes');

chai.use(chaiHttp);
chai.should();

describe('Algorithms', () => {
  describe('Get Algorithms Error', () => {
    it('should return status code 500', (done) => {
      chai.request(server)
        .get('/algorithm')
        .end((err, res) => {
          res.should.have.status(HttpStatus.INTERNAL_SERVER_ERROR);
          done();
        });
    });
  });
});

describe('Ref Species', () => {
  describe('Get Species', () => {
    // This test is really specific to this version of the app
    // and should be refactored and/or removed in future releases.
    it('should return status code 200 Ok', (done) => {
      chai.request(server)
        .get('/algorithm/StrainEst/species')
        .end((err, res) => {
          const correct = 'Escherichia coli';
          res.body[0].should.equal(correct);
          res.should.have.status(HttpStatus.OK);
          done();
        });
    });
  });
  describe('Get Species Error', () => {
    it('should return status code 404 Not Found', (done) => {
      chai.request(server)
        .get('/algorithm/Bib/species')
        .end((err, res) => {
          res.should.have.status(HttpStatus.NOT_FOUND);
          done();
        });
    });
  });
});
