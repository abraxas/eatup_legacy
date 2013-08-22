var crypto = require('crypto'),
    uuid = require('node-uuid'),
    mongoose = require('mongoose'),
    config = require('../../config.json')

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;




var UserSchema = new Schema({
  username : { type: String, required: true, unique: true },
    email : { type: String, required: true },
    salt : { type: String, default: uuid.v1 },
    passwordHash : { type: String }
});

var hash = function(passwd, salt) {
  return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
};

UserSchema.static('findByUsername', function(username,fields,options,callback) {
  return this.findOne({username: username},fields,options,callback);
})


UserSchema.methods.setPassword = function(pass) {
  this.passwordHash = hash(pass, this.salt);
}

UserSchema.methods.isValidPassword = function( pwd ) {
  return this.passwordHash === hash(pwd, this.salt);
}

UserSchema.methods.getRecipes = function(callback) {
  var Recipe = mongoose.model('Recipe');
  return Recipe.findByUser(this,callback);
}

mongoose.model('User', UserSchema);

var U = mongoose.model('User');

var du = config.default_users;

for (var ai in du) {
  var au = du[ai];

  U.findByUsername(au.username,function(err,auser) {
    if(!auser) {
      var u = new U({
        username: au.username,
        email: au.email 
      });
      u.setPassword(au.password);
      u.save(function(){})
    }
    else {
    }
  })
}


return U;
