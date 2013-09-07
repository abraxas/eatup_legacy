
/*
 * GET home page.
 */

var Recipe = require('mongoose').model('Recipe');

exports.register_routes = function(app) {
  var cookbook = exports;
  app.get('/cookbook*',cookbook.base);
  //app.post('/cookbook*',cookbook.base);

  app.get('/cookbook',cookbook.list);

}

exports.base = function(a,b,next){next()}
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

