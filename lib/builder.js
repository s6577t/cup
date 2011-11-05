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
    var buffer = ['/*', this.cup.licence(), '*/', ';'];

    this.cup.javascriptsFor('build').forEach(function (javascript) {
      buffer.push(fileTransform(fs.readFileSync(javascript).toString()));
      buffer.push(';');
    });

    return buffer.join('');
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

      var cupfile = this.cup.cupfile();

      if (typeof cupfile.beforeBuild === 'function') cupfile.beforeBuild(this.cup);

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
          buildResult.error = e;
          result.error = e;
        }

        buildResult[task] = result;
      });

      buildResult.status = buildResult.status || 'ok';

      if (buildResult.status === 'ok') {
        try {

          var buildDirectory = this.cup.pathTo('build');

          if (!path.existsSync(buildDirectory)) {
            fs.mkdirSync(buildDirectory);
          }

          ['concatenate', 'uglify'].forEach(function (outputName) {
            var output = buildResult[outputName];

            output.path = outputName === 'uglify' ? self.cup.pathToUglified() : self.cup.pathToConcatenated();
            fs.writeFileSync(output.path, output.output);

            var stat = fs.statSync(output.path);
            output.size = stat.size;
          });

          if (buildResult.uglify.size) {
            buildResult.uglify.percentage = (100 * buildResult.uglify.size / buildResult.concatenate.size).toFixed(3) + '%';
          } else {
            buildResult.uglify.percentage = 'n/a';
          }

        } catch (e) {
          buildResult.error = e;
          buildResult.status = 'failed';
        }
      }

      if (typeof cupfile.afterBuild === 'function') cupfile.afterBuild(this.cup);

      return buildResult;
    }
  }

  return Builder;
})();
