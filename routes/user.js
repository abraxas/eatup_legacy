
/*
 * GET users listing.
 */

var mongoose = require('mongoose');
var User = mongoose.model("User");

exports.list = function(req, res){
  User.find({},function(err,users) {
    res.render('users', { title: 'Express',layout: "layout",users: users });
  })
};
