var path   = require('path'),
    fs     = require('fs'),
    vm     = require('vm'),
    semver = require('semver');

var Cup = exports = module.exports = (function () {

  function Cup (folderPath) {
    folderPath = folderPath || '.';
    this.path = path.resolve(folderPath);
  };

  Cup.prototype = {
    cupfile: function () {

      var cupfilePath = this.pathTo('cupfile');

      if (!path.existsSync(cupfilePath)) {
        throw new Error('No "cupfile" found in ' + this.path);
      }

      var fileContents = fs.readFileSync(cupfilePath);
      var cupfileClosure = '(function () { return ' + fileContents + ' })();';

      return vm.runInNewContext(cupfileClosure);
    }
    , pathTo: function (childnode) {
      return path.join(this.path, childnode);
    }
    , licence: function () {
      return fs.readFileSync(this.pathTo(this.cupfile.licence)).toString();
    }
    , cupfileErrors: function () {
      var cupfile = this.cupfile();
      var errors = [];

      if (!cupfile.name.match(/^[\w-\.]*$/)) {
        errors.push('cup name must be a valid filename (a-z,A-Z,0-9,_,- only)');
      }

      if (!semver.valid(cupfile.version)) {
        errors.push('cup version is not a valid semver (http://semver.org/)');
      }

      try {
        var stat = fs.statSync(this.pathTo(cupfile.licence));
        if (!stat.isFile()) {
          throw new Exception('licence file does not exist')
        }
      } catch (e) {
        errors.push('licence not valid: ' + e.message);
      }

      return errors;
    }
    , throwIfCupfileInvalid: function () {
      var errors = this.cupfileErrors();
      if (errors.length) {
        throw new Exception(errors.join())
      };
      return this;
    }
  };

  Cup.standardSubdirectories = ['vendor', 'spec', 'spec/visual', 'spec/env', 'lib', 'src'];

  return Cup;
})();


