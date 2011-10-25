var builder = exports = module.exports = {
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
