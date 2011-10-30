var fs   = require('fs'),
    path = require('path');

exports = module.exports = {
  filelist: function (dir) {

    dir = path.resolve(dir);

    var files = [], dirs = [dir];

    while(dirs.length) {

      var dir = dirs.shift();

      fs.readdirSync(dir).forEach(function (entry) {
        entry = path.join(dir, entry);
        
        var stat = fs.statSync(entry);

        if (stat.isFile()) {
          files.push(entry)
        } else if (stat.isDirectory()) {
          dirs.push(entry);
        }
      });
    }

    return files;
  }
}