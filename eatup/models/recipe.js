var crypto = require('crypto'),
    uuid = require('node-uuid'),
    mongoose = require('mongoose'),
    config = require('../../config.json')

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var User = mongoose.model('User');

var IngredientSchema = new Schema({
  amount: Number,
  measure: String,
  ingredient: String
});

var RecipeSchema = new Schema({
  _user : { type: ObjectId, required: true, ref: 'User' },
  name : { type: String, required: true },
  description : String,
  ingredients : [IngredientSchema],
  steps : [String]
});


var UserSchema = new Schema({
  username : { type: String, required: true, unique: true },
    email : { type: String, required: true },
    salt : { type: String, default: uuid.v1 },
    passwordHash : { type: String }
});

RecipeSchema.static('findByUser', function(user,fields,options,callback) {
  var _user = user._id;
  return this.findByUserId(_user,fields,options,callback);
})

RecipeSchema.static('findByUserId', function(user_id,fields,options,callback) {
  return this.find({_user: user_id},fields,options,callback);
})

RecipeSchema.methods.getUser = function(callback) {
  this.populate('_user').exec(callback);
}

mongoose.model('Ingredient', IngredientSchema);
mongoose.model('Recipe', RecipeSchema);




return mongoose.model('Recipe');
