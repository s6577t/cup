var Cup = require('../../'),
    path = require('path'),
    wrench = require('wrench'),
    fs = require('fs');

var testCups = [];
var removeTestCupsOnExitCalled = false;

function copyFileSync (source, target) {
  fs.writeFileSync(target, fs.readFileSync(source));
}

function testCup (n, createExtension) {
  return function () {
    testCups[n] = testCups[n] || (function () {

      var name = 'test-cup-' + n + '_' + new Date().getTime();

      var testCup = new Cup(path.resolve(name));

      testCup.create = function () {

        fs.mkdirSync(this.path, 0744);
        fs.mkdirSync(this.path + '/vendor', 0744);
        fs.mkdirSync(this.path + '/spec', 0744);
        fs.mkdirSync(this.path + '/spec/env', 0744);
        fs.mkdirSync(this.path + '/spec/visual', 0744);
        fs.mkdirSync(this.path + '/lib', 0744);
        fs.mkdirSync(this.path + '/src', 0744);
        
        copyFileSync(__dirname + '/cupfile.test_content', this.path + '/cupfile');
        
        if (createExtension) createExtension.call(this);
        return this;
      }

      testCup.remove = function () {
        wrench.rmdirSyncRecursive(this.path);
        return this;
      }

      return testCup;
    })();

    return testCups[n];
  }
}

function removeTestCups () {
  testCups.forEach(function (testCup) {
    if (path.existsSync(testCup.path)) {
      testCup.remove();
    }
  });
}

exports = module.exports = {
  removeTestCupsOnExit: function () {
    if (removeTestCupsOnExitCalled) return;
    removeTestCupsOnExitCalled = true;
    process.on('exit', removeTestCups);
    process.on('uncaughtException', removeTestCups);
    return this;
  },
  copyFileSync: copyFileSync,
  testCup1: testCup(1, function () {

  }),
  testCup2: testCup(2)
}