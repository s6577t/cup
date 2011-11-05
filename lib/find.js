var fs   = require('fs'),
    path = require('path');

exports = module.exports = {
  // iterative, breadth-first file listing
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
  // recursive, depth-first file&directory listing
  , entrylist: function (dir, includeDirectories) {
    var self = this;
    var dir = path.resolve(dir);

    var entries = [];

    fs.readdirSync(dir).forEach(function (entry) {
      entry = path.join(dir, entry);

      var stat = fs.statSync(entry);

      if (stat.isFile()) {
        entries.push(entry);
      } else if (stat.isDirectory()) {
        if (includeDirectories) entries.push(entry);
        entries = entries.concat(self.entrylist(entry));
      }
    })

    return entries;
  }
}