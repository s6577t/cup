var fs          = require('fs'),
    wrench      = require('wrench'),
    path        = require('path'),
    technicolor = require('./technicolor');

var statusThemes = {
    info    : { bold: true }
  , ok      : { color: 'white', backgroundColor: 'blue', bold: true }
  , confirm : { color: 'green', bold: true }
  , warning : { color: 'black', backgroundColor: 'brightYellow', bold: true }
  , error   : { color: 'brightRed', bold: true }
  , fatal   : { color: 'white', backgroundColor: 'brightRed', bold: true }
}

var shell = {
  status: function (status) {
    return {
      message: function (message) {

        if (arguments.length > 1 && (typeof arguments[arguments.length-1] === 'object')) {
          message = technicolor(message, arguments[arguments.length-1]);
          delete arguments[arguments.length-1];
          arguments.length--;
        }

        var message = " " + technicolor(status, statusThemes[status]) + "\t" + message;

        arguments[0] = message;
        console.info.apply(console, arguments);
      }
    }
  }
  , say: function () {

    var technicolorOptions = null;

    if (arguments.length > 1) {
      var lastArg = arguments[arguments.length-1];
      if (lastArg && typeof lastArg == 'object') {
        technicolorOptions = lastArg;
        arguments[arguments.length-1] = '';
      }
    }

    if (technicolorOptions) arguments[0] = technicolor(arguments[0], technicolorOptions);

    console.info.apply(console, arguments);
  }
  , emptyDirectory: function (dir) {

    if (path.existsSync(dir)) {
      this.status('error').message(dir + ' already exists');
      return false;
    }

    wrench.mkdirSyncRecursive(dir, 0755);
    this.status('confirm').message('directory created: ' + technicolor(dir, {underline: true}));

    return true;
  }
  , createFile: function (file, content) {

    if (path.existsSync(file)) {
      this.status('error').message(file + ' already exists');
      return false;
    }

    fs.writeFileSync(file, content || '');
    this.status('confirm').message('file created: ' + technicolor(file, {underline: true}));

    return true;
  }
}

exports = module.exports = shell;