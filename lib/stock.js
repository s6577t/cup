var path          = require('path'),
    fs            = require('fs'),
    http          = require('http'),
    url           = require('url'),
    child_process = require('child_process');

function download (options, onSuccess, onError) {
  return http.get(options, function(res) {
    if (res.statusCode >= 200 && res.statusCode < 300) {

        var buffer = [];

        res.on('data', function (chunk) {
          buffer.push(chunk.toString());
        });
        res.on('end', function () {
          onSuccess(buffer.join(''));
        });

      } else {
        onError('HTTP '+ res.statusCode +': http://' + options.host + options.path);
      }
  }).on('error', function(e) {
    onError('Request Failed: ' + ': http://' + options.host + options.path , e);
  });
}

exports = module.exports = {
  cupfile: function (name) {
    var cupfile = fs.readFileSync(path.join(__dirname, '../stock/cupfile')).toString();
    return cupfile.replace('#NAME', name);
  }
  , licence: function () {

    var licence = fs.readFileSync(path.join(__dirname, '../stock/licence.txt')).toString();

    licence = licence
      .replace('#TIME', new Date().getFullYear())
      .replace('#USER', process.env['USER'] || 'THE MAN');

    return licence;
  }
  , extraJasmineMatchers: function (name) {
    return fs.readFileSync(path.join(__dirname, '../stock/extra_jasmine_matchers.js')).toString();
  }
  , jQueryURL: 'http://code.jquery.com/jquery.min.js'
  , jasmineURL: 'http://pivotal.github.com/jasmine/downloads/jasmine-standalone-1.1.0.zip'
  , downloadJQuery: function (onSuccess, onError) {
      var options = url.parse(this.jQueryURL);
      return download({host: options.host, path: options.pathname}, onSuccess, onError || function () {});
  }
  , downloadAndUnpackJasmine: function(into, onSuccess, onError) {
    child_process.exec(
      'sh ' +
      path.join(__dirname, '../bin/cup-download-jasmine') +
      ' "' + into + '" "' + this.jasmineURL + '"',
      function (error, stdout, stderr) {
        if (error !== null) {
          onError(stderr || error.message);
        } else {
          onSuccess();
        }
    });
  }
}