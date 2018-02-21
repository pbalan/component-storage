
/**
 * Module dependencies.
 */
const path = require('path');
const SG = require('strong-globalize');
SG.SetRootDir(path.join(__dirname, '..'));
const g = SG();
const storage = require('./storage');
var exports = module.exports = storage;
