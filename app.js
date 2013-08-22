/**
 * Module dependencies.
 */

//Never used directly..this sets up the mongoose singleton for us.
var models = require('./eatup/models');

var express = require('express');
var minify = require('express-minify');
var routes = require('./routes');
var user = require('./routes/user');
var recipes = require('./routes/recipes');
var http = require('http');
var klei = require('klei-dust');
var path = require('path');
var dpm = require('dust-partials-middleware');
var flash = require('connect-flash');
var mongoose = require('mongoose');

var remember = require('./public/javascripts/remember');  

var nav = require('./eatup/nav');

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

app.use(function(req,res,next) {
  remember.forget();
  next();
})

klei.useHelpers = 1;
klei.onDustInit(function(dust) {
  var df = require('./public/javascripts/dust-filters');  
  df.attach_helpers(dust);
});

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

  app.use(function(req,res,next) {

    //after render callback
    var _render = res.render;
    res.render = function(view, options, fn) {
      var self = this,
          options = options || {},
          req = this.req,
          app = req.app;

      // support callback function as second arg
      if ('function' == typeof options) {
        fn = options, options = {};
      }

      options._locals = self.locals;

      // default callback to respond
      fn = fn || function(err, str){
        if (err) return req.next(err);
        self.send(str);
      };

      _render.call(res, view, options, function(err,body) {


        var data = remember.get();

        var jsdom = require('jsdom');
        jsdom.env({
          html: body,
          scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
          done: function (err, window) {
            window.jQuery('body').attr('data-remember',data);
            body = "<!DOCTYPE HTML>" + window.document.innerHTML;
            fn(err,body);
          } 
        });
      })

    };
    next();    
  });

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


nav.load_menu(app);



app.get('/', routes.index);
app.get('/users', user.list);

app.use('/partials',dpm(__dirname,'/views'));

//default layout (can be overridden if needed)
app.locals.layout = 'layout'


recipes.register_routes(app);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
