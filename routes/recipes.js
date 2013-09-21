
/*
 * GET home page.
 */

var fs = require('fs') 

exports.register_routes = function(app) {
  var recipes = exports;
  app.get('/recipes*',recipes.base);
  app.post('/recipes*',recipes.base);
  app.get('/recipes',recipes.list);
  app.get('/recipes/new',recipes.add);
  app.post('/recipes/new',recipes.create);
  app.get('/recipes/:id*',recipes.id_base);
  app.post('/recipes/:id*',recipes.id_base);
  app.get('/recipes/:id/edit',recipes.edit);
  app.get('/recipes/:id/view',recipes.view);
  app.post('/recipes/:id/edit',recipes.update);
  app.get('/recipes/:id/delete',recipes.remove);
  app.get('/recipefudge',recipes.recipefudge);

  app.get('/recipes/:id/image',recipes.image);
}

var remember = require('../public/javascripts/remember')

var User = require('mongoose').model('User');
var Recipe = require('mongoose').model('Recipe');

exports.base = function(req,res,next) {
  console.log("base");
  res.locals.active_tab = 'recipes'
  
//  if(!req.user) {
//  User.findOne(function(e,user) {
//    req.login(user, function(err) {  
//      next();
//    })
//  })
//  }
//  else {
    next();
//  }
}

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
  res.render('recipe_new', { recipe: {} });
}

exports.view = function(req, res){
  res.render('recipe_view', { });
}

exports.edit = function(req, res){
  res.render('recipe_edit', { });
}

var checks = function(req) {

  req.check('name',"Required").notNull()
  req.check('description',"Required").notNull()

  console.log("BODDY " + JSON.stringify(req.body))

  req.check('steps.0',"Required").notNull()
  for(var stepid in req.body.steps) {
    if(stepid>0) {
      console.log("CHECK STEP " + "steps."+stepid)
      req.check('steps.'+stepid,"Required").notNull()
    }
  }

  for(var ingid in req.body.ingredients) {
    req.check(['ingredients',ingid,'amount'],"Invalid").isNumeric()
    req.check(['ingredients',ingid,'measure'],"Required").notNull()
    req.check(['ingredients',ingid,'ingredient'],"Required").notNull()
  }
  

}


exports.create = function(req, res){
  var proto = homogenize(req.body);

  proto._user = req.user._id;
  res.locals.recipe = new Recipe(proto);
  console.log("SET " + JSON.stringify(proto));

  checks(req)
  var errors = req.validationErrors();

  if(errors) {
    console.log("WTF ERRORS + " + JSON.stringify(errors))
    var tmp = errors;
    errors = {}
    for(var i in tmp) {
      var e = tmp[i];
      if(errors[e.param]) {
        errors[e.param] = errors[e.param]+e.msg;
      } else {
        errors[e.param] = [e.msg];
      }
    }
      res.render('recipe_new', {errors: errors});
      return;
  }

  res.locals.recipe.save(function(err,obj) {
    res.redirect('/recipes');
  });
}

var homogenize = function(body) {
  if(body.set) {
    var bodyset = Array.isArray(body.set) ? body.set : [body.set];
    for(var i in bodyset) {
    
      var set = bodyset[i]
      var rval = [];
      if(!body[set]) {
        var arrx = Object.keys(body).map(function(a) {
          if(a.indexOf(set + ".") == 0) {
            return a;
          }
        }).filter(function(a) {return a});
      
        var arry = arrx.map(function(z) { return body[z] })
        console.log(JSON.stringify(arry))
        var ml = arrx.map(function(a) { return body[a].length })
        console.log(JSON.stringify(ml))
        var j = Math.max.apply(null,ml)

        for(var idx=0; idx < j; idx++) {
          var aobj = {}
          var yes = 0;
          for (var fldi in arrx) {
            var fld = arrx[fldi]
            var rlfld = fld.replace(RegExp("^" + set + "\\."),"")
            aobj[rlfld] = body[fld][idx] 
          }        
          rval.push(aobj);
        }
        body[set] = rval
      }
    }
  }

  return body;
}

exports.update = function(req, res, next) {
  var recipe = res.locals.recipe;
  var flds = ['name','description','ingredients','steps']

    var data = homogenize(req.body);  

  for(var i in flds) {
    var f = flds[i]
      recipe[f] = data[f]      
  }

  checks(req)
    var errors = req.validationErrors();

  if(errors) {
    var tmp = errors;
    errors = {}
    for(var i in tmp) {
      var e = tmp[i];
      if(errors[e.param]) {
        errors[e.param] = errors[e.param]+e.msg;
      } else {
        errors[e.param] = [e.msg];
      }
    }
    res.render('recipe_edit', {errors: errors,blah: "fnord"});
    return;
  }
  recipe.save(function(err) {
    if(errors) {      
      //return next(err);

      res.render('recipe_edit');
    } else {
      //Adding file stuff
      var file = req.files.image;
      if(file) {
        console.log("Uploadage " + file.path);
        recipe.saveImage(file,function(err,file) {
          console.log("SAVED? " + err)
          if(file) {
            console.log(file._id)
            console.log(file.name)
          }
          res.redirect('/recipes');
        })      
        } else {
          console.log("NO FILE");
          res.redirect('/recipes');
        }





    }
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

exports.image = function(req,res,next) {
  var recipe = res.locals.recipe;
  var image_id = recipe.image_id;

  recipe.getImageStream(res,"Image not found");
}
