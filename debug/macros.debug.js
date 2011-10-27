var macros = require('../test/support/macros'),
    Cup    = require('../'),
    fs     = require('fs'),
    vm     = require('vm');

var cup = macros.testCup2().create();
console.info(cup.cupfilePath);
fs.statSync(cup.cupfilePath);

//console.info(cup.cupfile());

//macros.testCup1().remove();

