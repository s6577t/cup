var http = require('http');

var options = {
  host: 'code.jquery.com',
  path: '/jquery.min.jss',
};

function success (body) {
  console.info(body);
}

function error (e) {
  console.error(e);
}

http.get(options, function(res) {

  if (res.statusCode >= 200 && res.statusCode < 300) {
    
    var buffer = [];
    
    res.on('data', function (chunk) {
      buffer.push(chunk.toString());
    });

    res.on('end', function (s) {
      success(buffer.join(''));
    });
  
  } else {
    error('HTTP '+ res.statusCode +': ' + options.host + options.path);
  }
}).on('error', function(e) {
  error(e);
});