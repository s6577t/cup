var Cup    = require('../'),
    vows   = require('vows'),
    assert = require('assert'),
    macros = require('./support/macros'),
    path   = require('path');


function isParsedAs (expectedValue) {

  var context = {
    topic: function (cup) {
      var value = cup.cupfile()[this.context.name];
      return value;
    }
  }

  context['should be equal to "' + expectedValue + '"'] = function (value) {
    assert.equal(value, expectedValue, this.context.name + ' should have been parsed as "' + expectedValue + '" but was "' + value + '"');
  }

  return context;
}

macros.removeTestCupsOnExit();

vows.describe('cup').addBatch({
  'a new Cup': {
    topic: new Cup('env'),
    'should have a fully resolved path': function (cup) {
      assert.equal(cup.path, path.resolve('env'));
    },
    'without a specfied folder' : {
      topic: new Cup(),
      'should have the cwd as its path': function (cup) {
        assert.equal(path.resolve('.'), cup.path);
      }
    }
  },
  'load paths': {
    topic: Cup.loadPaths,
    'should contain vendor, spec, lib, src': function (topic) {
      assert.include(topic, 'vendor');
      assert.include(topic, 'spec');
      assert.include(topic, 'lib');
      assert.include(topic, 'src');
    }
  },
  'when a Cupfile exists': {
    topic: macros.testCup1().create(),
    'the cupfile is parsed without error': function (cup) {

      assert.doesNotThrow(function () {
        cup.cupfile();
      }, Error);
    },
    'name': isParsedAs('test cup'),
    'version': isParsedAs('0.0.1'),
    'licence': isParsedAs('licence.txt')
  },
  'when a Cupfile does not exist': {
    topic: macros.testCup2().create(),
  }
}).export(module);

