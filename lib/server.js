/**
 * Module dependencies.
 */

var express = require('express');
var builder = require('./builder');
var server = module.exports = express.createServer();

// Configuration

server.configure(function(){
  server.set('views', __dirname + '/../views');
  server.set('view engine', 'jade');
  server.set('view cache', false)
  server.use(express.bodyParser());
  server.use(express.methodOverride());
  server.use(server.router);
  server.use(express.static(__dirname + '/public'));
});

server.configure('development', 'testing', function(){
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.configure('production', function(){
  server.use(express.errorHandler());
});

// Routes

server.get('/', function(req, res){
  builder.build('./lib/server.js', function (result) {
    res.render('index', {
      title: 'cup',
      javascript: result
    });
  })
});
