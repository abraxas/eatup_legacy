/**
 * Module dependencies.
 */

//Never used directly..this sets up the mongoose singleton for us.
var models = require('./models');

var express = require('express');
var minify = require('express-minify');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var cons = require('consolidate');
var path = require('path');
var dpm = require('dust-partials-middleware');



var app = express();

app.engine('dust',cons.dust);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'dust');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'dd05cede-040e-11e3-856f-002170491e5c'}));
app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/views',express.static(path.join(__dirname,'/views')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.use('/partials',dpm(__dirname,'/views'));


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
