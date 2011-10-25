var Folder = require('../').folder,
    vows = require('vows'),
    assert = require('assert'),
    path = require('path');

vows.describe('folder').addBatch({
  'a new Folder': {
    topic: new Folder('env'),
    'should have a fully resolved path': function (folder) {
      assert.equal(folder.path, path.resolve('env'));
    }
  },
  'load paths': {
    topic: Folder.load_paths,
    'should contain vendor, spec, lib, src': function (topic) {
      assert.include(topic, 'vendor');
      assert.include(topic, 'spec');
      assert.include(topic, 'lib');
      assert.include(topic, 'src');
    }
  }
}).export(module);

