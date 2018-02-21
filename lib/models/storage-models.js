
const filesDef = require('../../common/models/Model.Files.json');

// Remove proerties that will confuse LB
function getSettings(def) {
  let settings = {};
  for (var s in def) {
    if (s === 'name' || s === 'properties') {
      continue;
    } else {
      settings[s] = def[s];
    }
  }
  return settings;
}

module.exports = function(dataSource) {
  // "Files"
  const files = dataSource.createModel(
    filesDef.name,
    filesDef.properties,
    getSettings(filesDef)
  );

  return {
    files: files,
  };
};
