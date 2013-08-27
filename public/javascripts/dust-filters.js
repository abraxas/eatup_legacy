//let's call this the dust-wrap
(function(exports,dust){

if(typeof window === 'undefined') {
//  remember = require('./remember')
  dust.helpers = require('dustjs-helpers').helpers
}

function jsonFilter(key, value) {
  if (typeof value === "function") {
    return value.toString();
  }
  return value;
}

var count_storage = {}
exports.forget = function() {
  count_storage = {};
}
if(typeof window !== 'undefined') {
  exports.forget();
}
exports.countUpInit = dust.helpers.countUpInit = function(chunk,context,bodies,params) {
  count_storage = {}
  return chunk.write("");
}

exports.countUp = dust.helpers.countUp = function(chunk,context,bodies,params) {
//  var count_storage = remember('countUp.storage');
//  if(!count_storage) { count_storage = {} }

  var domain = dust.helpers.tap(params.domain, chunk, context) || "none";
  var rebase = dust.helpers.tap(params.rebase, chunk, context);
  var avar = dust.helpers.tap(params.var, chunk, context);

  var i = count_storage[domain]
  if(i == null) {
    if(typeof window !== 'undefined') {
      var div = $("#"+domain+"-domain");
      if(div && div.data('value')) {
        i = div.data('value') - 1;
      }
    }    
    else {
      i = -1;
    }
  }
  //console.log("DOMAIN " + domain + " CS " + JSON.stringify(count_storage));
  i=i+1
  
  count_storage[domain] = i; 
//  remember('countUp.storage',count_storage);

  var count = i;
  var body = bodies.block;
  if(body) {
    if(rebase) {
      var x = {index: count }
      console.log("IN ERE!")
      console.log(JSON.stringify(context.stack.head))
      x[rebase] = context.stack.head;
      return bodies.block(chunk,context.push(x))
    }
    else if(avar) {
      var r = context.stack.head    
      r[avar] =  count_storage[domain];
//      context.stack.head[avar] = count_storage[domain]
//      console.log("AVAR " + count_storage[domain])
//      console.log("AVAR " + JSON.stringify(context.stack.head))
      console.log("RDRR : " + JSON.stringify(r))
      return bodies.block(chunk,context.push(r))
    }
    else {
      return bodies.block(chunk,context.push(count))
    }
    //return bodies.block(chunk, context.push(context.stack.index));
  }

  //return chunk.write(i-1); 
}

exports.is_err = dust.helpers.is_err = function(chunk,context,bodies,params) {
  var id = dust.helpers.tap(params.id, chunk, context);
  var errors = context.get('errors')

  if(errors) {

    if(errors[id]) {
      return bodies.block(chunk,context);
    }
    if(id.indexOf("*") > -1) {
      id.replace(/\*/g,'.*');
      var pat = new RegExp("^" + id + "$")
      for(var key in errors) {
        if(pat.test(key)) {
          return bodies.block(chunk,context);
        }
      }
    }

  }
  return chunk.write();
}

exports.error = dust.helpers.error = function(chunk,context,bodies,params) {
  var id = dust.helpers.tap(params.id, chunk, context);
  var rebase = dust.helpers.tap(params.rebase, chunk, context);

//  console.log("WTF");

  var newcontext = {};
//  if(rebase) {
//    newcontext.rebase = context.stack.head;
//  }

  var errors = context.get('errors')
  if(errors) {
    var error = errors[id]

    console.log("ID " + JSON.stringify(id))
    console.log("ERR " + JSON.stringify(errors[id]))

    if(errors && errors[id]) {
      return bodies.block(chunk,context.push(error));
    }
  }
  return chunk.write();
}

exports.last = dust.helpers.last = function(chunk, context, bodies) {
    var body = bodies.block;
    if (context.stack.index === context.stack.of - 1) {
      if(body) {
       return bodies.block(chunk, context);
      }
    }
    return chunk;
  },

exports.attach_helpers = function(adust) {
  adust.helpers.countUp = exports.countUp;
  adust.helpers.error = exports.error;
  adust.helpers.is_err = exports.is_err;
  adust.helpers.last = exports.last;

}

//~end of dust-wrap
})(typeof exports === 'undefined'? this['mymodule']={}: exports,typeof dust === 'undefined' ? require('dustjs-helpers') : dust);
