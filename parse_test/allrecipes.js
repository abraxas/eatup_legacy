var jsdom = require('jsdom')
var fs = require('fs')


var parse_allrecipes = function(src) {  
  jsdom.env(
      src,
      ["http://code.jquery.com/jquery.js"],
      function (errors, window) {
        var $ = window.$;

        var rval = {}

        rval.title = $('#itemTitle').html()
    rval.desc = $('#lblDescription').html()
    rval.default_serving = $('.servings .emph-text').text()

    //    var ingredients_raw = $('#liIngredient');
    rval.ingredients = [];

  $('ul.ingredient-wrap li').each(function(i,e) {
    var amt = $(e).find('#lblIngAmount').text();
    var name = $(e).find('#lblIngName').text();
    rval.ingredients.push({amount: amt,ingredient: name});
  })

  rval.directions = [];
  $('div.directions li').each(function(i,e) {
    var step = $(e).find('span').text();
    rval.directions.push(step)
  })


  console.log(JSON.stringify(rval));

      }
  );


}

//var x = fs.readFile('allrecipes_test.html','utf8',function(err,data) {
//  parse_allrecipes(data)
//})

var argv = require('optimist').argv;

console.log(argv._)

parse_allrecipes(argv._[0])
