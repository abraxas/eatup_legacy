//let's call this the dust-wrap
(function(exports,dust){

if(typeof window === 'undefined') {
  remember = require('./remember')
}

function jsonFilter(key, value) {
  if (typeof value === "function") {
    return value.toString();
  }
  return value;
}

//var count_storage = {}
dust.helpers.countUp = function(chunk,context,bodies,params) {
  var count_storage = remember('countUp.storage');
  if(!count_storage) { count_storage = {} }

  var domain = dust.helpers.tap(params.domain, chunk, context) || "none";
  var rebase = dust.helpers.tap(params.rebase, chunk, context);
  var avar = dust.helpers.tap(params.var, chunk, context);

  var i = count_storage[domain]
  if(i == null) {
    i = -1;
  }
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
      return bodies.block(chunk,context.push(count_storage[domain]))
    }
    //return bodies.block(chunk, context.push(context.stack.index));
  }

  //return chunk.write(i-1); 
}
exports.countUp = dust.helpers.countUp

exports.is_err = dust.helpers.is_err = function(chunk,context,bodies,params) {
  var id = dust.helpers.tap(params.id, chunk, context);
  var errors = context.get('errors')
  if(errors && errors[id]) {
    return bodies.block(chunk,context);
  }
  return chunk.write();
}

exports.error = dust.filter.error = function(chunk,context,bodies,params) {
  var id = dust.helpers.tap(params.id, chunk, context);
  var rebase = dust.helpers.tap(params.rebase, chunk, context);

  var newcontext = {};
  if(rebase) {
    newcontext.rebase = context.stack.head;
  }

  var errors = context.get('errors')
  newcontext.error = errors[id]

  if(errors && errors[id]) {
    return bodies.block(chunk,context.push(newcontext));
  }
  return bodies.block(chunk,context);
}

exports.field = dust.helpers.field = function(chunk,context,bodies,params) {
  var newcontext = {};

  var name = dust.helpers.tap(params.name, chunk, context);
  var base = dust.helpers.tap(params.base, chunk, context);
  var key = dust.helpers.tap(params.key, chunk, context) || name;

  var errors = context.get('errors')


  if(name == ".") {
  newcontext.value = context.stack.head
  }
  else {
  newcontext[name] = context.get(name)
  newcontext.value = context.get(name)
  }

  if(errors && errors[key]) {
    newcontext.error = errors[key].map(function(x) { return x.msg })
    newcontext.error_class = "error";
  }

  console.log("ON: " + JSON.stringify(newcontext));


  //console.log("WHAT: " + JSON.stringify(chunk));
  return bodies.block(chunk,context.push(newcontext));
}

exports.attach_helpers = function(adust) {
  adust.helpers.countUp = exports.countUp;

}

//~end of dust-wrap
})(typeof exports === 'undefined'? this['mymodule']={}: exports,typeof dust === 'undefined' ? require('dustjs-helpers') : dust);
