
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view cache', false)
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', 'testing', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){

  var uglify = require("uglify-js"), // symlink ~/.node_libraries/uglify-js.js to ../uglify-js.js
      jsp = uglify.parser,
      pro = uglify.uglify;

  var fs = require('fs');

  fs.readFile('app.js', 'utf8', function (error, input) {
    if (error) throw error;

    var ast = jsp.parse(input); // parse code and get the initial AST
    ast = pro.ast_mangle(ast); // get a new AST with mangled names
    ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
    var final_code = pro.gen_code(ast); // compressed code here

    res.render('index', {
      title: 'Cup',
      javascript: final_code
    });
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
