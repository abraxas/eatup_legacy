/**
 * Module dependencies.
 */

//Never used directly..this sets up the mongoose singleton for us.
var models = require('./eatup/models');

var express = require('express');
var expressValidator = require('express-validator')
var RedisStore = require('connect-redis')(express)
var sessionStore = new RedisStore()

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
var RememberMeStrategy = require('passport-remember-me').Strategy;

var remember = require('./public/javascripts/remember');  

var nav = require('./eatup/nav');

//passport local policy
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;


var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

//Test Login





//remember-me stuff!

var randomString = function(len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

passport.use(new RememberMeStrategy(
  function(token, done) {
    consumeRememberMeToken(token, function(err, uid) {
      if (err) { return done(err); }
      if (!uid) { return done(null, false); }
      
      findById(uid, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
      });
    });
  },
  issueToken
));

function issueToken(user, done) {
  var token = randomString(64);
  saveRememberMeToken(token, user.id, function(err) {
    if (err) { return done(err); }
    return done(null, token);
  });
}

//end of remember-me!


var app = express();

var tokens = {}

function consumeRememberMeToken(token, fn) {
  var uid = tokens[token];
  // invalidate the single-use token
  delete tokens[token];
  express.session('remember_me', tokens)
  return fn(null, uid);
}

function saveRememberMeToken(token, uid, fn) {
  tokens[token] = uid;
  express.session('remember_me', tokens)
  return fn();
}


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
  app.use(expressValidator());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'dd05cede-040e-11e3-856f-002170491e5c',store: sessionStore}));


  app.use(passport.initialize());
  app.use(passport.session());
  app.use(passport.authenticate('remember-me'));

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

//  app.use(function(req,res,next) {

    //after render callback
//    var _render = res.render;
//    var data = remember.get();

//    var _render = res.render;
//    res.render = function(view, options, callback) {
//       _render.call(res, "Views/" + view, options, callback);
//    };
//    next();


// });
  app.use(function(a,b,next) {
//    var dj = require('./public/javascripts/dust-filters.js')
//    dj.forget();
    next()
  })

  app.use(app.router);


});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res, next) {
    
    issueToken(req.user, function(err, token) {
      if (err) { return next(err); }
      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
      return next();
    });

    res.redirect('/');
  });

app.get('/logout', 
  function(req, res) {
    res.clearCookie('remember_me');
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
app.get('/new_account', user.new_account);
app.post('/new_account', user.create_account);
app.get('/users/:id/delete',user.remove);

app.use('/partials',dpm(__dirname,'/views'));

//default layout (can be overridden if needed)
app.locals.layout = 'layout'


recipes.register_routes(app);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
