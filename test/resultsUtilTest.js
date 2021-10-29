const resultsUtil = require('../backend/util/resultsUtil');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

describe('resultsUtil.readAbundances', () => {
  it('should a map data structure containing name-abundance pairs', () => {
    const abundanceStr = '\nGCF_000831565.1_ASM83156v1_genomic.fna\t0.100000'
      + '\nGCF_000242055.1_Esch_coli_TA124_V1_genomic.fna\t0.200000'
      + '\nGCF_000194415.1_ASM19441v2_genomic.fna\t0.000000\n';
    const abundances = resultsUtil.readAbundances(abundanceStr, 'StrainEst', 'ecoli');
    expect(abundances).to.have.property('Esch_coli_ECC-1470').equals(0.1);
    expect(abundances).to.have.property('Esch_coli_TA124_V1').equals(0.2);
  });
});

describe('resultsUtil.readAbundances not found algorithm', () => {
  it('should return empty results', () => {
    const abundanceStr = '\nGCF_000831565.1_ASM83156v1_genomic.fna\t0.200000';

    const abundances = resultsUtil.readAbundances(abundanceStr, 'BIB', 'ecoli');
    expect(abundances).to.be.deep.equal({});
  });
});

describe('resultsUtil.getNwkTree ok', () => {
  it('should return a nwk string given a species', () => {
    const nwk = resultsUtil.getNwkTree('ecoli');
    expect(nwk).to.match(/\);/);
  });
});

describe('resultsUtil.getNwkTree fail', () => {
  it('should return an empty string when the param is invalid', () => {
    const nwk = resultsUtil.getNwkTree('coli');
    expect(nwk).to.equal('');
  });
});
