
const debug = require('debug')('component:storage');
const accessLogger = require('../middleware/access-logger');
const userContext = require('../middleware/user-context');

module.exports = function componentCommerce(app, options) {
  debug('initializing component');
  const {loopback} = app;
  options = options || {};

  let dataSource = options.dataSource;
  /* istanbul ignore if */
  if (typeof dataSource === 'string') {
    dataSource = app.dataSource[dataSource];
  }
  const storageModels = require('./storage-models')(dataSource);
  const userModel = loopback.findModel(options.userModel) ||
      loopback.getModelByType(loopback.User);
  debug('User model: %s', userModel.modelName);

  // Initialize middleware
  app.middleware('auth:after', userContext());
  app.middleware('routes:before', accessLogger());

  let users = {};

  let internalConfig = {
    userModel: userModel,
  };

  // global configs
  const files = require('./Files')(storageModels, internalConfig);

  let customModels = options.models || {};
  let models = {
    user: customModels.users || users,
    files: customModels.files || files,
  };

  return models;
};
