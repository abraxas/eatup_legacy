
/*
 * GET users listing.
 */

var mongoose = require('mongoose');
var User = mongoose.model("User");

exports.list = function(req, res){
  User.find({},function(err,users) {
    res.render('users', { title: 'Express', users: users });
  })
};

exports.new_account = function(req,res) {
  
  res.render('new_account', { });
};

exports.create_account = function(req,res) {
  var proto = req.body;
  res.locals.user = new User(proto);

  res.locals.user.save(function(err,obj) {
    req.login(res.locals.user,function(e,u) {
      if(!err) {      
        res.redirect('/recipes');
      }
      else {
        console.log("WHAT " + err)
        res.render('new_account', { });
      }
    })
  })
  
};

exports.remove = function(req,res) {
  User.findById(req.params.id).remove(function() {
    res.redirect('/users');
  })

};
