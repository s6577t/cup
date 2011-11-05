var technicolor = require('../lib/technicolor')

message = function (message) {
  var message = " " + 'status' + "\t" + message;
  arguments[0] = message;

  if (arguments.length > 1 && (typeof arguments[arguments.length-1] === 'object')) {
    arguments[0] = technicolor(message, arguments[arguments.length-1]);
    delete arguments[arguments.length-1];
    arguments.length--;
  }

  console.info.apply(console, arguments);
}

message('hello', {color: 'red'})