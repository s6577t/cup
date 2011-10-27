var Cup = require('../../'),
    path = require('path'),
    wrench = require('wrench'),
    fs = require('fs');

var testCups = [];
var removeTestCupsOnExitCalled = false;

function testCup(n, createExtension) {
  return function () {
    testCups[n] = testCups[n] || (function () {

      var testCup = new Cup(path.resolve('test-cup-' + n + '_' + new Date().getTime()));

      testCup.create = function () {
        fs.mkdirSync(this.path, 0744);
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

exports = module.exports = {
  removeTestCupsOnExit: function () {
    if (removeTestCupsOnExitCalled) return;
    removeTestCupsOnExitCalled = true;
    process.on('exit', removeTestCups);
    process.on('uncaughtException', removeTestCups);
    return this;
  },
  testCup1: testCup(1, function () {
    fs.writeFileSync(this.path + '/Cupfile', fs.readFileSync('./test/support/cupfile.test_content'));
  }),
  testCup2: testCup(2)
}

function removeTestCups() {
  testCups.forEach(function (testCup) {
    try {
      testCup.remove();
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  });
}