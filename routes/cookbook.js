
/*
 * GET home page.
 */

var Recipe = require('mongoose').model('Recipe');

exports.register_routes = function(app) {
  var cookbook = exports;
  app.get('/cookbook*',cookbook.base);
  app.get('/cookbook/:id*',cookbook.id_base);  
  //app.post('/cookbook*',cookbook.base);

  app.get('/cookbook',cookbook.list);
  app.get('/cookbook/:id/view',cookbook.view);

}

exports.base = function(a,b,next){next()}

exports.id_base = function(req,res,next) {
  console.log("RECIPE_ID_BASE");

  var id = req.params.id;
  var rx = Recipe.findById(id);

  res.locals.recipe_q = rx;
  rx.exec(function(err,recipe) {
    res.locals.recipe = recipe;
    console.log("OI " + JSON.stringify(recipe))
    next();
  })
}

exports.list = function(req,res,next){
  if(req.user) {
      Recipe.findByUser(req.user,function(err,rex) {
        res.render('cookbook', { results: rex, });
      })
    }
    else {
      res.render('login', { });
    }
}

exports.view = function(req, res){
  res.render('cookbook_recipe_view', { });
}

//to do front-end redirect, try:
//
//history.pushState({},'test','/cookbook')
