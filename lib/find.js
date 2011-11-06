var fs   = require('fs'),
    path = require('path');

exports = module.exports = {
  // iterative, breadth-first file listing excluding files that start with .
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
  , entrylist: function (dir, options) {
    options = options || {};
    var self = this;
    var dir = path.resolve(dir);

    var entries = [];

    fs.readdirSync(dir).forEach(function (entry) {
      if (!options.showHidden && entry.match(/^\./)) return;

      entry = path.join(dir, entry);

      var stat = fs.statSync(entry);

      if (stat.isFile()) {
        entries.push(entry);
      } else if (stat.isDirectory()) {
        if (options.includeDirectories) entries.push(entry);
        entries = entries.concat(self.entrylist(entry));
      }
    })

    return entries;
  }
}