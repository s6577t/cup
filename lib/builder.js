var path   = require('path'),
    fs     = require('fs'),
    uglify = require("uglify-js"),
    jsp    = uglify.parser,
    pro    = uglify.uglify;

exports = module.exports = (function () {

  function Builder (cup) {
    this.cup = cup;
  }

  function process (fileTransform) {
    var buffer = [this.cup.licence(), ';'];

    this.cup.javascripts().forEach(function (javascript) {
      buffer.push(fileTransform(fs.readFileSync(javascript).toString()));
      buffer.push(';');
    });

    return buffer.join();
  }

  Builder.prototype = {
    concatenate: function () {
      return process.call(this, function (input) {
        return input;
      })
    }
    , uglify: function () {
      return process.call(this, function (input) {
        var ast = jsp.parse(input); // parse code and get the initial AST
        ast = pro.ast_mangle(ast); // get a new AST with mangled names
        ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
        return pro.gen_code(ast); // compressed code here
      })
    }
    , build: function () {

      var buildResult = {};
      var self = this;

      ['concatenate', 'uglify'].forEach(function (task) {

        var result = {};

        try {
          var output = self[task]();
          result.status = 'ok';
          result.output = output;
        } catch (e) {
          result.status = 'failed';
          buildResult.status = 'failed';
          result.error = e;
        }

        buildResult[task] = result;
      });

      buildResult.status = buildResult.status || 'ok';

      if (buildResult.status === 'ok') {
        try {

          var buildDirectory = this.cup.pathTo('build');
          if (!path.existsSync(buildDirectory) {
            fs.mkdirSync(buildDirectory);
          }

          fs.writeFileSync(this.cup.pathToConcatenated, buildResult.concatenated.output);
          fs.writeFileSync(this.cup.pathToUglified, buildResult.uglified.output);

        } catch (e) {
          buildResult.error = e;
        }
      }

      return buildResult;
    }
  }

  return Builder;
})();





var a = {

  build: function (file, callback) {

    var uglify = require("uglify-js"), // symlink ~/.node_libraries/uglify-js.js to ../uglify-js.js
        jsp = uglify.parser,
        pro = uglify.uglify;

    var fs = require('fs');

    fs.readFile(file, 'utf8', function (error, input) {
      if (error) throw error;

      var ast = jsp.parse(input); // parse code and get the initial AST
      ast = pro.ast_mangle(ast); // get a new AST with mangled names
      ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
      var final_code = pro.gen_code(ast); // compressed code here

      callback(final_code);
    });

    return callback;
  }
}
