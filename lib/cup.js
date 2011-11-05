var path          = require('path'),
    fs            = require('fs'),
    find          = require('./find'),
    vm            = require('vm'),
    semver        = require('semver'),
    child_process = require('child_process'),
    package       = require('./package');

var Cup = exports = module.exports = (function () {

  function Cup (folderPath) {
    folderPath = folderPath || '.';
    this.path = path.resolve(folderPath);
  };

  function schemeLoadPaths (scheme) {
    switch (scheme) {
      case 'spec':
        return ['vendor', 'spec', 'lib', 'src'];
      case 'spec-concatenated':
      case 'spec-uglified':
        return ['vendor', 'spec'];
      case 'build':
        return ['lib', 'src'];
      case 'debug':
        return ['vendor', 'lib', 'src'];
      default:
        throw new Error('scheme not known: '+scheme);
    }
  }

  function groupBySubdir (cupfilePath, javascripts) {
    var r = new RegExp('^' + cupfilePath + '/(\\w+)/(.*)$');

    return javascripts.reduce(function (grouped, javascript) {
      var matches = r.exec(javascript);
      var group;

      if (matches && (group = grouped[matches[1]])) {
        group.push(javascript)
      }

      return grouped;
    }, { vendor: [], spec: [], lib: [], src: [] });
  }

  function applyJavascriptPatterns (cupPath, availableJavascripts, javascriptPatterns) {
    javascriptPatterns = javascriptPatterns || {};

    var matchedJavascripts = {};

    for (var subdir in availableJavascripts) {

      var patterns    = javascriptPatterns[subdir];
      var javascripts = availableJavascripts[subdir];
      var matches     = [];

      if (patterns) {
        patterns.forEach(function (pattern) {

          if (typeof pattern === 'string') {
            if (pattern === '*') {
              matches = matches.concat(javascripts)
            } else {
              var javascript = path.join(cupPath, subdir, pattern);
              matches.push(javascript);
            }
          } else if (typeof pattern === 'function') {
            matches = matches.concat(javascripts.filter(function (js) {
              return !!pattern(js)
            }));
          }
        })
      } else {
        matches = javascripts;
      }

      var added = {};
      matches = matches.filter(function (javascript) {
        if (added[javascript]) return false;
        added[javascript] = true;
        return true;
      })

      matchedJavascripts[subdir] = matches;
    }

    return matchedJavascripts;
  }

  Cup.prototype = {
      cupfile: function () {

      var cupfilePath = this.pathTo('cupfile');
      var fileContents = fs.readFileSync(cupfilePath);
      var cupfileClosure = '(function () { return ' + fileContents + ' })();';

      try {
        return vm.runInThisContext(cupfileClosure, cupfilePath);
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
      return path.join(this.pathToBuild(), this.cupfile().name + '-' + this.cupfile().version + '.min.js');
    }
    , pathToConcatenated: function () {
      return path.join(this.pathToBuild(), this.cupfile().name + '-' + this.cupfile().version + '.js');
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
    , availableJavascripts: function () {

      // all javascripts, absolute paths, array
      var allJavascripts = find.filelist(this.path).filter(function (file) {
        return !!file.match(/\.js$/);
      });

      // all javascripts in vendor, spec, lib and src directories, by hash, absolute paths
      return groupBySubdir(this.path, allJavascripts);
    }
    , groupedJavascripts: function () {
      return applyJavascriptPatterns(this.path, this.availableJavascripts(), this.cupfile().javascripts);
    }
    , javascripts: function () {

      var javascripts = [];

      if (arguments.length == 0) arguments = ['vendor', 'spec', 'lib', 'src'];

      var all = applyJavascriptPatterns(this.path, this.availableJavascripts(), this.cupfile().javascripts);

      for (var i = 0; i < arguments.length; i++) {
        var group = all[arguments[i]];

        if (group) javascripts = javascripts.concat(group);
      }

      return javascripts;
    }
    , javascriptsFor: function (scheme) {

      var javascripts = [],
          loadPaths   = schemeLoadPaths(scheme);

      var all = applyJavascriptPatterns(this.path, this.availableJavascripts(), this.cupfile().javascripts);

      loadPaths.forEach(function (loadPath) {
        javascripts = javascripts.concat(all[loadPath]);
      });

      switch (scheme) {
        case 'spec-concatenated':
          javascripts.push(this.pathToConcatenated());
          break;
        case 'spec-uglified':
          javascripts.push(this.pathToUglified());
          break;
        default:
          break;
      }

      return javascripts;
    }
    , stylesheets: function (callback) {
      return find.filelist(this.path).filter(function (file) {
        return !!file.match(/\.css$/);
      });
    }
    , visualSpecs: function () {

      var self = this;

      return find.filelist(path.join(this.path, 'spec/visual')).filter(function (file) {
        return path.extname(file) === '.jade';
      }).reduce(function (h, jade) {
        var name = jade.match(new RegExp(self.pathTo('spec/visual') + '/(.*)\.jade$'))[1];
        h[name] = jade;
        return h;
      }, {});
    }
  };

  Cup.standardSubdirectories = ['vendor', 'spec', 'spec/visual', 'spec/env', 'lib', 'src'];

  return Cup;
})();


