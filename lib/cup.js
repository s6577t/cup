var path          = require('path'),
    fs            = require('fs'),
    find          = require('./find'),
    vm            = require('vm'),
    semver        = require('semver'),
    child_process = require('child_process');

var Cup = exports = module.exports = (function () {

  function Cup (folderPath) {
    folderPath = folderPath || '.';
    this.path = path.resolve(folderPath);
  };

  Cup.prototype = {
    cupfile: function () {

      var cupfilePath = this.pathTo('cupfile');
      var fileContents = fs.readFileSync(cupfilePath);
      var cupfileClosure = '(function () { return ' + fileContents + ' })();';

      try {
        return vm.runInNewContext(cupfileClosure);
      } catch (e) {
        throw new Error('Error parsing cupfile');
      }
    }
    , pathTo: function (childnode) {
      return path.join(this.path, childnode);
    }
    , pathToBuild: function () {
      return this.pathTo('build');
    }
    , pathToUglified: function () {
      return path.join(this.pathToBuild(), this.cupfile().name + '-' + this.cupfile.version + '.min.js');
    }
    , pathToConcatenated: function () {
      return path.join(this.pathToBuild(), this.cupfile().name + '-' + this.cupfile.version + '.js');
    }
    , licence: function () {
      return fs.readFileSync(this.pathTo(this.cupfile().licence)).toString();
    }
    , cupfileErrors: function () {

      try {
        var cupfile = this.cupfile();
      } catch (e) {
        return [e.message];
      }

      var errors = [];

      if (!cupfile.name.match(/^[\w-\.]*$/)) {
        errors.push('cup name must be a valid filename (a-z,A-Z,0-9,_,- only)');
      }

      if (!semver.valid(cupfile.version)) {
        errors.push('cup version is not a valid semver (http://semver.org/)');
      }

      try {
        var licencePath = this.pathTo(cupfile.licence);
        var stat = fs.statSync(licencePath);
        if (!stat.isFile()) {
          throw new Error(licencePath + ' does not reference a file')
        }
      } catch (e) {
        errors.push('licence not valid: ' + e.message);
      }

      return errors;
    }
    , cupfileStatus: function() {

      var cupfilePath = this.pathTo('cupfile');

      if (!path.existsSync(cupfilePath)) {
        return 'not found';
      }

      var errors = this.cupfileErrors();
      if (errors.length) {
        return 'not valid';
      }

      return 'present and valid';
    }
    , javascripts: function (callback) {

      var allJavascripts = find.filelist(this.path).filter(function (file) {
        return !!file.match(/\.js$/);
      });


    }
    , stylesheets: function (callback) {
      return find.filelist(this.path).filter(function (file) {
        return !!file.match(/\.css$/);
      });
    }
  };

  Cup.standardSubdirectories = ['vendor', 'spec', 'spec/visual', 'spec/env', 'lib', 'src'];

  return Cup;
})();


