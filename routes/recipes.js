
/*
 * GET home page.
 */

exports.recipe_base = function(req,res,next) {
  res.locals.active_tab = 'recipes'
  next();
}


exports.recipes = function(req, res){
  res.render('index', { title: 'Express'});
}

