//let's call this the dust-wrap
(function(exports,dust){

var count_storage = {};

dust.helpers.countUp = dust.filters.countUp = function(chunk,context,bodies,params) {
  if(!dust.helpers.countUp.storage) { dust.helpers.countUp.storage = {} }

  var domain = dust.helpers.tap(params.domain, chunk, context) || "none";

  var i = count_storage[domain] || 0;
  console.log("DOMAIN " + domain + " CS " + JSON.stringify(count_storage));
  i=i+1
  
  count_storage[domain] = i; 
  return chunk.write(i-1); 
}
exports.countUp = dust.helpers.countUp

exports.attach_helpers = function(adust) {
  adust.helpers.countUp = exports.countUp;

}

//~end of dust-wrap
})(typeof exports === 'undefined'? this['mymodule']={}: exports,typeof dust === 'undefined' ? require('dustjs-helpers') : dust);
