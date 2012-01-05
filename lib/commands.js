var technicolor = require('technicolor')
  , Cup         = require('../')
  , Builder     = require('./builder')
  , package     = require('./package')
  , stock       = require('./stock')
  , path        = require('path')
  , fs          = require('fs')
  , sh          = require('./shell');



function withValidCupfile (callback) {
  var cup = new Cup();
  var cupfileStatus = cup.cupfileStatus();

  switch(cupfileStatus) {
    case 'not found':
      sh.status('error').message('cupfile not found');
      break;
    case 'not valid':
      sh.status('error').message('cupfile not valid');
      cup.cupfileErrors().forEach(function (error) {
        sh.say(error);
      })
      break;
    default:
      callback(cup);
  }

  return cup;
}

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

  addCommand('help', "you're looking at it, this is the default command in a directory without a cupfile", function () {
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

        return nameDesc;
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

  addCommand('server', 'start a cup server, this is the default command in a directory with a cupfile', ['port=1212'], function (port) {
    withValidCupfile(function () {
      var server = require('./server');
      port = parseInt(port) || 1212;
      server.listen(parseInt(port));
      server.settings.env =  path.existsSync(__dirname + '/../development') ? 'development' : 'production';
      sh.say('cup server launched on port %d', port);
      if (server.settings.env === 'development') sh.status('notice').message('running in development mode');
    })
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
      sh.status('ok', 'jquery downloaded').message(technicolor(stock.jQueryURL, {underline: true}));
      sh.createFile(cup.pathTo('vendor/jquery.min.js'), jquery);
    }, function (message, e) {
      sh.status('error', 'download').message(message);
      if (e) console.info(e);
    })

    stock.downloadAndUnpackJasmine(cup.pathTo('spec/env'), function () {
      sh.status('ok', 'jasmine unpacked').message(technicolor(stock.jasmineURL, {underline: true}))
    }, function (error) {
      sh.status('error').message('download/unpack failed: ' + technicolor(stock.jasmineURL, {underline: true}))
      sh.say(error);
    });
  });

  addCommand('version', 'shows the version of cup and the version of this cup if there is one', function () {
    sh.say('cup v' + package.version);
    var cup = new Cup();
    var cupfileStatus = cup.cupfileStatus();
    if (cupfileStatus === 'present and valid') {
      var cupfile = cup.cupfile();
      sh.say('%s v%s', cupfile.name, cupfile.version, {underline: true, bold: true});
    }
  });

  addCommand('javascripts', 'list all javascripts in the current cup in the correct order as defined by the cupfile', ['*[vendor|spec|lib|src]'], function () {
    var args = arguments;
    withValidCupfile(function (cup) {
      cup.javascripts.apply(cup, args).forEach(function (javascript) {
        console.info(javascript);
      });
    })
  });

  addCommand('scheme', "list javascripts for the specified scheme. Schemes:\n\t* build: all files included in the build\n\t* spec-uglified: all files needed to run specs on the uglified output\n\t* spec-concatenated: all files needed to run specs on the concatenated output\n\t* debug: all files needed to debug code in the browser console\n\t* spec: all files needed to run specs on the source", ['scheme'], function (scheme) {
    withValidCupfile(function (cup) {
      cup.javascriptsFor(scheme).forEach(function (javascript) {
        console.info(javascript);
      });
    })
  });

  addCommand('validate', 'check the status of the cupfile', function () {
    withValidCupfile(function () {
      sh.status('ok').message('cupfile valid')
    })
  })

  addCommand('concatenate', 'concatenates lib and src files in the order specified by the cupfile, print the result to stdout', function () {
    withValidCupfile(function (cup) {
      var builder = new Builder(cup);
      console.info(builder.concatenate());
    });
  });

  addCommand('uglify', 'uglifies the concatenation, print the result to stdout', function () {
    withValidCupfile(function (cup) {
      var builder = new Builder(cup);
      console.info(builder.uglify());
    });
  });

  addCommand('build', 'uglify and concatenate into the build directory running any before/after build hooks specified in the cupfile', function () {
    withValidCupfile(function (cup) {
      var builder = new Builder(cup);
      var result = builder.build();

      if (result.status == 'ok') {
        sh.status('ok').message("concatenated [%d bytes]:\t" + technicolor('%s', {underline: true}), result.concatenate.size, result.concatenate.path);
        sh.status('ok').message("uglified [%d bytes, %s]:\t" + technicolor('%s', {underline: true}), result.uglify.size, result.uglify.percentage, result.uglify.path);
      } else {
        sh.status('error').message('build failed');
        console.info(result.error);
      }
    });
  });

  addCommand('visuals', 'list visual specs to stdout', function () {
    withValidCupfile(function (cup) {
      Object.keys(cup.visualSpecs()).forEach(function (vs) {
        console.info(vs);
      })
    })
  });

  return commands;
})();