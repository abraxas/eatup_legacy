//let's call this the dust-wrap
(function(exports,dust){

if(typeof window === 'undefined') {
  remember = require('./remember')
}

//var count_storage = {}
dust.helpers.countUp = function(chunk,context,bodies,params) {
  var count_storage = remember('countUp.storage');
  if(!count_storage) { count_storage = {} }

  var domain = dust.helpers.tap(params.domain, chunk, context) || "none";
  var rebase = dust.helpers.tap(params.rebase, chunk, context);

  var i = count_storage[domain] || 0;
  //console.log("DOMAIN " + domain + " CS " + JSON.stringify(count_storage));
  i=i+1
  
  count_storage[domain] = i; 
  remember('countUp.storage',count_storage);

  var body = bodies.block;
  if(body) {
    if(rebase) {
      var x = {index: count_storage[domain] }
      console.log("IN ERE!")
      console.log(JSON.stringify(context.stack.head))
      x[rebase] = context.stack.head;
      return bodies.block(chunk,context.push(x))
    }
    else {
      return bodies.block(chunk,context.push(count_storage[domain]))
    }
    //return bodies.block(chunk, context.push(context.stack.index));
  }

  //return chunk.write(i-1); 
}
exports.countUp = dust.helpers.countUp

exports.attach_helpers = function(adust) {
  adust.helpers.countUp = exports.countUp;

}

//~end of dust-wrap
})(typeof exports === 'undefined'? this['mymodule']={}: exports,typeof dust === 'undefined' ? require('dustjs-helpers') : dust);
