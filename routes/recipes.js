
/*
 * GET home page.
 */

var User = require('mongoose').model('User');
var Recipe = require('mongoose').model('Recipe');

exports.base = function(req,res,next) {
  console.log("base");
  res.locals.active_tab = 'recipes'
  
  if(!req.user) {
  User.findOne(function(e,user) {
    req.login(user, function(err) {  
      next();
    })
  })
  }
  else {
    next();
  }
}

exports.id_base = function(req,res,next) {
  console.log("RECIPE_ID_BASE");

  var id = req.params.id;
  var rx = Recipe.findById(id);

  res.locals.recipe_q = rx;
  console.log("I I " + JSON.stringify(res.locals));
  rx.exec(function(err,recipe) {
    console.log("J J " + JSON.stringify(res.locals));
    res.locals.recipe = recipe;
    next();
  })
}


exports.list = function(req, res){
  if(req.user) {
    Recipe.findByUser(req.user,function(err,rex) {
      res.render('recipes', { recipes: rex, });
    })
  }
  else {
    res.render('login', { });
  }
}


exports.add = function(req, res){
  res.render('recipe_new', { });
}
exports.edit = function(req, res){
  res.render('recipe_edit', { });
}

exports.create = function(req, res){
  var proto = req.body;
  proto._user = req.user._id;
  var r = new Recipe(proto);
  console.log("SET " + JSON.stringify(proto));
  
  r.save(function(err,obj) {
    console.log("ERROR? " + err);
    res.redirect('/recipes');
  });
}
exports.update = function(req, res) {
  var recipe = res.locals.recipe;
  var flds = ['name','description']
  for(var i in flds) {
    var f = flds[i]
    console.log("DOSET " + f + " is " + req.body[f])      
    recipe[f] = req.body[f]      
  }
  recipe.save(function(err,obj) {
    console.log("ERROR? " + err);
     res.redirect('/recipes');
  });
}

exports.remove = function(req, res){
  console.log("REMOVE");
    console.log("L J " + JSON.stringify(res.locals));
  res.locals.recipe_q.remove(function() {
    res.redirect('/recipes');
  })
}

exports.recipefudge = function(req, res){
  var u = req.user;
  var r = new Recipe({_user: u._id,name: "tezt"});
  r.save(); 

  res.render('index', { });
}

