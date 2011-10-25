var technicolor = require(__dirname + '/technicolor')

module.exports = (function () {
  var commands = {};

  function addCommand(name, description, args, commandFunc) {

    if (typeof args === 'function') {
      commandFunc = args;
      args = {};
    }

    commands[name] = commandFunc;
    commandFunc.desc = description;
    commandFunc.args = args;
  }

  addCommand('help', "you're looking at it", function () {
    console.info("");

    for (var commandName in commands) {

      var command = commands[commandName];

      var argsDesc = Object.keys(command.args).map(function (key) {
        var defaultValue = command.args[key];

        var keyDesc;

        if (defaultValue === null || typeof defaultValue === 'undefined') {
          keyDesc = key;
        } else {
          keyDesc = key + '=' + defaultValue;
        }

        return '<'+keyDesc+'>';
      }).join(' ');


      console.info(
        ' ' +
        technicolor(commandName,  {bold: true}) +
        " " +
        argsDesc +
        "\n  " +
        command.desc +
        "\n");
    }
  });

  addCommand('server', 'start a cup server', { port:1212, host: null, kerning: null }, function () {
    console.info("create");

  });

  addCommand('create', 'setup a cup folder structure', { name:null }, function () {
    console.info("server");
  });

  return commands;
})();