var remember = function() {
  var remember_data = {};

  var me = function(key,value) {
    //    console.log(JSON.stringify(remember_data));
    if(typeof window !== 'undefined') {
      if(!remember.loaded) {
        remember_data = $('body').data('remember') || {};
        remember.loaded = 1;
      }
    }
    //node

    if(value) { remember_data[key] = value; }
    return remember_data[key];
  }

  me.loaded = null;
  me.get = function() {
    return JSON.stringify(remember_data);
  }
  me.forget = function() {
    remember_data = {};
  }
  return me;
}()

if(typeof window === 'undefined') {
  (function(exports) {
    module.exports = remember
  })(typeof exports === 'undefined'? this['mymodule']={} : exports)
}
