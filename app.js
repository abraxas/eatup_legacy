/**
 * Module dependencies.
 */

//Never used directly..this sets up the mongoose singleton for us.
var models = require('./models');

var express = require('express');
var minify = require('express-minify');
var routes = require('./routes');
var user = require('./routes/user');
var recipes = require('./routes/recipes');
var http = require('http');
var cons = require('consolidate');
var klei = require('klei-dust');
var path = require('path');
var dpm = require('dust-partials-middleware');
var flash = require('connect-flash');
var mongoose = require('mongoose');



//passport local policy
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;


var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;



//Test Login







var app = express();


// all environments
app.configure(function() {
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');

app.engine('dust',klei.dust);
app.set('view engine', 'dust');
  app.use(express.favicon());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/views',express.static(path.join(__dirname,'/views')));
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'dd05cede-040e-11e3-856f-002170491e5c'}));


  app.use(passport.initialize());
  app.use(passport.session());

  var User = mongoose.model('User');

  passport.use(new LocalStrategy(
      function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
          }
          if (!user.isValidPassword(password)) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, user);
        });
      }
      ));
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  //awesome pre-stash middleware for useful(less) stuff
  app.use(function (req,res,next) {
    if(req.user) {
      res.locals.current_user = req.user
    }
    next();
  })

  app.use(app.router);
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', 
  function(req, res) {
    req.logout()
    res.redirect('/login');
  });

app.get('/logmein', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/login',function(req,res) {
  res.render('login');
})



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function mh(a,b,c) {
  return {id: a,text: b,route: c}
}

app.locals.menu = [
  mh('cookbook','Cookbook'),
  mh('recipes','My Recipes','/recipes'),
  mh('help','Help'),
]

app.locals.is_active_tab = function(chunk,context,bodies) {
  return chunk.tap(function(data) {
    var me = context.current();
    var active = context.get('active_tab');
    console.log(JSON.stringify(me));
    console.log(active);
    if(me.id == active) {
      console.log("MATCH");
      return data;
    } else {
      return "";
    }
  }).render(bodies.block,context).untap()
}


app.get('/', routes.index);
app.get('/users', user.list);

app.use('/partials',dpm(__dirname,'/views'));

//default layout (can be overridden if needed)
app.locals.layout = 'layout'



app.get('/recipes*',recipes.base);
app.post('/recipes*',recipes.base);
app.get('/recipes',recipes.list);
app.get('/recipes/:id*',recipes.id_base);
app.post('/recipes/:id*',recipes.id_base);
app.get('/recipes/new',recipes.add);
app.post('/recipes/new',recipes.create);
app.get('/recipes/:id/edit',recipes.edit);
app.post('/recipes/:id/edit',recipes.update);
app.get('/recipes/:id/delete',recipes.remove);
app.get('/recipefudge',recipes.recipefudge);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
