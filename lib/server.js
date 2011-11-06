/**
 * Module dependencies.
 */

var express = require('express'),
    connect = require('connect'),
    stylus  = require('stylus'),
    path    = require('path'),
    jade    = require('jade'),
    fs      = require('fs');

var Cup       = require('./cup');
var Builder   = require('./builder');
var ViewModel = require('./view_model');

var server = exports = module.exports = express.createServer();

// Configuration

server.configure(function(){
  server.set('views', __dirname + '/../views');
  server.set('view engine', 'jade');
  server.set('view cache', false)
  server.use(express.bodyParser());
  server.use(express.methodOverride());
  server.use(server.router);
  server.use(express.static(path.resolve('.'), {hidden: true}));
});

server.configure('development', 'testing', function(){
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.configure('production', function(){
  server.use(express.errorHandler());
});

server.get('/cup.css', function (request, response) {

  fs.readFile(__dirname + '/../views/cup.stylus', function (error, data) {
    if (error) throw error;
    stylus.render(data.toString(), function(error, css){
      if (error) throw error;
      response.send(css, { 'Content-Type': 'text/css' }, 200);
    });
  })
});

server.get('/cup.js', function (request, response) {

  fs.readFile(__dirname + '/../views/cup.js', function (error, data) {
    if (error) throw error;
    response.send(data.toString(), { 'Content-Type': 'application/javascript' }, 200);
  })
})

function withValidCupfile(callback) {
  return function (request, response, next) {
    var cup = new Cup;

    if (cup.cupfileStatus() !== 'present and valid') {
      response.send('cupfile not ok. run "cup validate" to debug.', { 'Content-Type': 'application/javascript' }, 200);
      return;
    }

    callback(request, response, next, cup);
  }
}

function renderTemplate(template, options) {
  options = options || {};
  options.scheme = options.scheme || 'debug';
  return withValidCupfile(function (request, response, next, cup) {

    var viewModel = new ViewModel(cup, options);

    if (options.build && viewModel.buildResult.status !== 'ok') {
      response.render('error', viewModel);
      return;
    }

    viewModel.layout = options.layout;

    response.render(template, viewModel);
  });
}

server.get('/',                  renderTemplate('root', {build: true}));
server.get('/spec',              renderTemplate('spec', {scheme: 'spec'}));
server.get('/spec/concatenated', renderTemplate('spec', {scheme: 'spec-concatenated', build: true}));
server.get('/spec/uglified',     renderTemplate('spec', {scheme: 'spec-uglified', build: true}));
server.get('/spec/visual',       renderTemplate('visuals', {visuals: true}));
server.get('/debug',             renderTemplate('debug'));
server.get('/empty',             renderTemplate('empty', {layout: false}));

server.get('/spec/visual/*',  withValidCupfile(function (request, response, next, cup){
  var name = request.path.match(new RegExp('/spec/visual/(.+)'))[1]
  var visualSpec = cup.visualSpecs()[name];
  if (visualSpec) {
    fs.readFile(visualSpec, function (error, data) {
      if (error) throw error;
      response.render('empty', {
        javascripts: cup.javascriptsFor('debug'),
        layout: false,
        name: name,
        jade: jade.compile(data)()
      })
    });
  } else {
    next();
  }
}))

server.get('/uglified',     withValidCupfile(function (request, response, next, cup) {
  var builder = new Builder(cup);
  response.send(builder.uglify(), { 'Content-Type': 'application/javascript' }, 200);
}));
server.get('/concatenated', withValidCupfile(function (request, response, next, cup) {
  var builder = new Builder(cup);
  response.send(builder.concatenate(), { 'Content-Type': 'application/javascript' }, 200);
}));

// catch the rest with a directory server
server.get(/.*/, connect.directory(path.resolve('.'), {icons: true, hidden: true}));

server.error(function(err, req, res, next){
  if (err instanceof NotFound) {
    res.render('not_found.jade');
  } else {
    next(err);
  }
});

