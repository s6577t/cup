var fs = require('fs');
exports = module.exports = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));