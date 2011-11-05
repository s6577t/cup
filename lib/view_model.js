var package = require('./package'),
    fs      = require('fs')
    Builder = require('./builder'),
    find    = require('./find');

exports = module.exports = function (cup, options) {

  var cupfile = cup.cupfile();
  var groupedJavascripts = cup.groupedJavascripts();

  var viewModel = {
      name         : cupfile.name
    , path         : cup.path
    , version      : cupfile.version
    , versionOfCup : package.version
    , ls           : find.entrylist(cup.path)
    , javascripts  : cup.javascriptsFor(options.scheme)
    , stylesheets  : cup.stylesheets()
    , libCount     : groupedJavascripts.lib.length
    , srcCount     : groupedJavascripts.src.length
  };

  if (options.build) {
    viewModel.buildResult = new Builder(cup).build();
  }

  if (options.visuals) {
     viewModel.visuals = cup.visualSpecs()
  }

  ['javascripts', 'stylesheets', 'ls'].forEach(function (nameOfListOfPaths) {

    var listOfPaths = viewModel[nameOfListOfPaths];

    viewModel[nameOfListOfPaths] = listOfPaths.map(function (path) {
      return path.match(new RegExp(viewModel.path + '\/(.*)'))[1];
    });
  });

  return viewModel;
}