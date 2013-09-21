var crypto = require('crypto'),
    uuid = require('node-uuid'),
    mongoose = require('mongoose'),
    config = require('../../config.json'),
    Grid = require('gridfs-stream')

var fs = require('fs')

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var User = mongoose.model('User');

var IngredientSchema = new Schema({
  amount: Number,
  measure: String,
  ingredient: {type: String, required: true}
});

var RecipeSchema = new Schema({
  _user : { type: ObjectId, required: true, ref: 'User' },
  name : { type: String, required: true },
  description :{ type: String },
  ingredients : [IngredientSchema],
  steps : [String],
  image_id : { type: ObjectId },
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

RecipeSchema.methods.saveImage = function(upload,callback) {
  var recipe = this;
  var gfs = Grid(mongoose.connection.db,mongoose.mongo);
  var args = {mode: 'w',filename: "recipe"};
  if(this.image_id) {
    args._id = this.image_id;
  }
  console.log("ARGH " + JSON.stringify(args))
  var writestream = gfs.createWriteStream(args);
  fs.createReadStream(upload.path).pipe(writestream);

  writestream.on('close',function(file) {
    console.log("Uploaded ID = " + file._id)
    console.log("SAVING " + recipe._id)
    recipe.image_id = file._id;
    recipe.save(function(err) {
      console.log("CABBA");
      callback(err,file);
    })
  })
}

RecipeSchema.methods.getImageStream = function(res,fof) {
  var image_id = this.image_id;
  if(!image_id) {
    if(fof) {
      res.send(404,fof);
      return;
    }
    else {
      if(res) {
        res.send(404,"File not found");
      }
      return null;
    }
  }
  var gfs = Grid(mongoose.connection.db,mongoose.mongo);

  var readstream = gfs.createReadStream({_id: image_id});
  if(res) {
    readstream.pipe(res)
  }
  else {
    
  }
  return readstream;
}

mongoose.model('Ingredient', IngredientSchema);
mongoose.model('Recipe', RecipeSchema);




return mongoose.model('Recipe');
