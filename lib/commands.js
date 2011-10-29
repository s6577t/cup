var technicolor = require(__dirname + '/technicolor')
  , Cup         = require('../')
  , stock       = require('./stock')
  , path        = require('path')
  , fs          = require('fs')
  , sh          = require('./shell');

exports = module.exports = (function () {
  var commands = {};

  function addCommand(name, description, args, commandFunc) {

    if (typeof args === 'function') {
      commandFunc = args;
      args = [];
    }

    commands[name] = commandFunc;
    commandFunc.desc = description;
    commandFunc.args = args;
  }

  addCommand('help', "you're looking at it", function () {
    console.info("");

    for (var commandName in commands) {

      var command = commands[commandName];

      var argsDesc = (command.args || []).map(function (arg) {
        var parts        = arg.split('='),
            name         = parts[0],
            defaultValue = parts[1];

        var nameDesc;

        if (defaultValue === null || typeof defaultValue === 'undefined') {
          nameDesc = name;
        } else {
          nameDesc = name + '=' + defaultValue;
        }

        return '<'+nameDesc+'>';
      }).join(' ');

      console.info(
        ' ' +
        technicolor(commandName, {color: 'blue', backgroundColor: 'white', bold: true}) +
        " " +
        argsDesc +
        "\n  " +
        command.desc +
        "\n");
    }
  });

  addCommand('server', 'start a cup server', ['port=1212'], function (port) {
    var server = require('./server');
    port = port || 1212;
    server.listen(parseInt(port));
    sh.status('info').message('cup server listening on port %d in %s mode', port, server.settings.env);
  });

  addCommand('create', 'setup a cup folder structure', ['name'], function (name) {

    if (!name.match(/^[\w-\.]*$/)) {
      sh.status('fatal').message('not a valid name: ' + name);
      return;
    }

    var directory = path.resolve(name);
    var directoryCreated = sh.emptyDirectory(directory);
    if (!directoryCreated) return;
    
    var cup = new Cup(directory);

    Cup.standardSubdirectories.forEach(function (subdir) {
      sh.emptyDirectory(cup.pathTo(subdir));
    });

    sh.createFile(cup.pathTo('cupfile'), stock.cupfile(name));
    sh.createFile(cup.pathTo('licence.txt'), stock.licence());
    sh.createFile(cup.pathTo('spec/env/extra_jasmine_matchers.js'), stock.extraJasmineMatchers());

    stock.downloadJQuery(function (jquery) {
      sh.status('ok').message('downloaded: ' + technicolor(stock.jQueryURL, {underline: true}));
      sh.createFile(cup.pathTo('vendor/jquery.min.js'), jquery);
    }, function (message, e) {
      sh.status('error').message(message);
      if (e) console.info(e);
    })

    stock.downloadAndUnpackJasmine(cup.pathTo('spec/env'), function (error) {
      sh.status('error').message('download/unpack failed: ' + technicolor(stock.jasmineURL, {underline: true}))
      sh.say(error);
    });
  });

  addCommand('version', 'shows the version of cup', function () {
    var package = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
    sh.say('cup v' + package.version, {color: 'brightGreen', backgroundColor: 'black', bold: true});
  });
  
  addCommand('javascripts', 'list all javascripts in the current cup in the correct order as defined by the cupfile', function () {
    var cup = new Cup();
  })
  
  return commands;
})();