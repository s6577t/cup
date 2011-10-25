var path = require('path');

var Folder = exports = module.exports = (function () {
  
  function Folder (folderPath) {
    this.path = path.resolve(folderPath);
  };
  
  Folder.prototype = {
  };
  
  Folder.load_paths = ['vendor', 'spec', 'lib', 'src'];
  
  return Folder;
})();


