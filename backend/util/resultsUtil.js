const fs = require('fs');
const path = require('path');

/**
 * Parse result according to specific algorithm.
 * When adding a new algorithm, add it to the switch statement
 * alongside the algorithm specific parsing function.
 *
 * @param data the result of a computation
 * @param algorithm the algorithm used
 * @param species reference species
 * @returns abundances: a map data structure containing name-abundance pairs
 */
const readAbundances = (data, algorithm, species) => {
  let abundances = {};

  switch (algorithm) {
    case 'StrainEst':
      abundances = parseStrainEst(data, species);
      break;
    default:
      console.log('Reading abundances for given algorithm is not defined.');
  }
  return abundances;
};

/**
 * Parse the StrainEst result.
 * Remove the first and last line of the result, filter out strains with zero abundance,
 * map the names, and then return a map data structure containing name-abundance pairs.
 *
 * @param data the result of a computation
 * @param species reference species
 * @returns abundances: a map data structure containing name-abundance pairs
 */
const parseStrainEst = (data, species) => {
  const lines = data.split('\n');
  lines.shift(); // remove first line
  lines.pop(); // remove last line
  const abundances = {};
  // for mapping names
  const map = mapNames('StrainEst', species);
  // Leave the map empty if the file is not found
  // map = map ? convertToMap(map) : {};

  lines.filter(x => {
    return (x.split('\t')[1] - 0) !== 0;
  }).forEach(x => {
    const nameAbundance = x.split('\t');
    const abundance = nameAbundance[1] - 0;
    const parts = x.split('_');
    const nameToMap = parts[0] + '_' + parts[1];
    const startIndex = nameToMap.length + 1;
    const endIndex = nameAbundance[0].length;
    let name = x.substring(startIndex, endIndex - 12);
    if (nameToMap in map) {
      name = map[nameToMap];
    }
    abundances[name] = abundance;
  });
  return abundances;
};

/**
 * Maps the name of the species.
 * Then store the mapping of different names in a map data structure.
 *
 * @param algorithm the algorithm used
 * @param species reference species
 * @returns the map containing keys and values
 */
const mapNames = (algorithm, species) => {
  // for mapping names
  let map;
  try {
    const treePath = `../algorithm/${algorithm}/mapping/${algorithm}_${species}.tsv`;
    const mapFilePath = path.join(__dirname, treePath);
    map = fs.readFileSync(mapFilePath).toString();
  } catch (e) {
    console.log('No mapping file found');
  }
  if (!map) return {};

  const lines = map.split('\n');
  const retMap = {};
  lines.forEach(x => {
    const split = x.split('\t');
    if (split.length === 2) {
      const key = split[0];
      const val = split[1].split('\r')[0];
      retMap[key] = val;
    }
  });

  return retMap;
};

/**
 * Get the stored nwk tree for a given species, if available.
 *
 * @param species species identifier, e.g. 'ecoli'
 * @returns .nwk tree file in a string format or empty string if not found
 */
const getNwkTree = (species) => {
  try {
    // get the relevant .nwk tree file to the frontend for display
    const nwkFilePath = path.join(__dirname, `../algorithm/phylotrees/${species}.nwk`);
    const nwkTree = fs.readFileSync(nwkFilePath);
    return nwkTree.toString();
  } catch (error) {
    // nwk tree file for this species doesn't exist or something else went wrong
    return '';
  }
};

module.exports = {
  readAbundances,
  getNwkTree
};
