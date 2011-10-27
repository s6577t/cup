var path = require('path'),
    fs   = require('fs'),
    vm   = require('vm');

var Cup = exports = module.exports = (function () {

  function Cup (folderPath) {
    this.path = path.resolve(folderPath);
    this.cupfilePath = this.path + '/Cupfile';
  };

  Cup.prototype = {
    cupfile: function () {

      try {
        var stat = fs.statSync(this.cupfilePath);
        var fileContents = fs.readFileSync(this.cupfilePath);
      } catch (e) {
        if (e.code === 'ENOENT') return null;
        throw e;
      }
      
      var cupfileClosure = '(function () { return ' + fileContents + ' })();';
      return vm.runInNewContext(cupfileClosure);
    },
    throwIfNoCupfile: function () {
      if (this.cupfile() === null) {
        throw new Error('No Cupfile found in ' + this.path);
      }
      return this;
    }
  };

  Cup.loadPaths = ['vendor', 'spec', 'lib', 'src'];
  Cup.commands = require('./commands');

  return Cup;
})();


