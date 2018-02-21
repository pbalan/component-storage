
module.exports = (storageModels, options) => {
  const debug = require('debug')('component:storage:files:model');
  const {userModel} = options;
  const filesModel = storageModels.files;

  // update relationships
  filesModel.belongsTo(userModel,
    {as: 'userCreated', foreignKey: 'createdBy'});

  let files = {};
  return files;
};
