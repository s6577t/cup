var Cup    = require('../'),
    vows   = require('vows'),
    assert = require('assert'),
    macros = require('./support/macros'),
    path   = require('path');

macros.removeTestCupsOnExit();


vows.describe('cup.javascripts').addBatch({
  //topic: macros.
}).export(module);