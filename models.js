var config = require('./config.json');

var db_data = config.database;

var exports = {};

var mongoose = exports.mongoose = require('mongoose');
mongoose.connect(config.database);
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;


exports.User = require('./models/user');
exports.Recipe = require('./models/recipe');


module.exports = exports;
