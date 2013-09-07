var is_active_tab = function(chunk,context,bodies) {
  return chunk.tap(function(data) {
    var me = context.current();
    var active = context.get('active_tab');
    console.log(JSON.stringify(me));
    console.log(active);
    if(me.id == active) {
      console.log("MATCH");
      return data;
    } else {
      return "";
    }
  }).render(bodies.block,context).untap()
}

function mh(a,b,c) {
  return {id: a,text: b,route: c}
}


exports.load_menu = function(app) {
  app.locals.menu = [
    mh('cookbook','Cookbook','/cookbook'),
    mh('recipes','My Recipes','/recipes'),
//    mh('help','Help')
  ]
  app.locals.is_active_tab = is_active_tab
}
