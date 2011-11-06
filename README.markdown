# Cup

INSERT A PICTURE OF A CUP

Command lines tools and a web application to help in developing javascript libraries and applications independently of anything else.

# Install

`npm install cup -g`

## Command Line App

Output from `cup help`:

    help
     you're looking at it, this is the default command in a directory without a cupfile

    server port=1212
     start a cup server, this is the default command in a directory with a cupfile

    create name
     setup a cup folder structure

    version
     shows the version of cup and the version of this cup if there is one

    javascripts *[vendor|spec|lib|src]
     list all javascripts in the current cup in the correct order as defined by the cupfile

    scheme scheme
     list javascripts for the specified scheme

    validate
     check the status of the cupfile

    concatenate
     concatenates lib and src files in the order specified by the cupfile

    uglify
     uglifies the concatenation

    build
     uglify and concatenate into the build directory


### The create Command

This command produces a folder containing:

* vendor: for vendor js libraries such as jquery and jasmine which are automatically downloaded. Note, the latest version of jquery is downloaded by default, for jasmine, cup currently downloads v1.1
* spec: where you will place you carefully prepared jasmine specs ;)
* spec/visual: some special case specs (more on this in the Browser App section below)
* src: ...
* lib: scripts in this folder are included in uglification and are always loaded before src. This directory is useful for third party libraries or support code which will be included in the build output.
* cupfile: a file which is used to describe the cup project (more in the `cupfile` section below)
* licence.txt: A default open source licence


## Cupfile

Sample cupfile with comments:

    {
      name: 'my project', # MUST be a valid file name
      version: '0.0.1', # must be a valid semver
      licence 'MIT.txt',

      javascripts: {

        spec: ['path/within/spec/dir.js', '*'], // <-- '*' means "all javascripts in the directory"

        vendor: ['only_one.js'], // <-- no :* symbol means only those explicitly listed scripts will be loaded

        // if lib load order was not explicitly declared cup defaults to the equivalent:

        lib: ['*'],

        src: [
          'an.js',
          'array.js',
          'can.js',
          'also.js',
          'be.js',
          'used.js',
          /so\/can\/regexps\/(.*)\.js/,
          function (path) {
            // and functions.
            return path !== 'do_not_include.js';
          }]
      },

      beforeBuild: function () {
        # whatever you want
      },

      afterBuild: function () {
        # whatever you want
      }
    }

Note: Multiple inclusions of the same javascript result in the omission of all but the first reference

## Browser App

* root: an overview of the project including links to build output and a file list for the project
* debug: a page on which the src javascripts and vendor javascripts are loaded but no specs, good for debugging and experimenting with your code in the console
* empty: the same as debug, but a completely empty page (no cup app header or css). This is for debugging UI components withoutany interference from the stylesheets or controls in the cup application itself.
* src: run specs on the lib and src files
* concatenated: run specs on the concatenated version of build output
* uglified: run specs on the uglified version of the build output
* visual: exercise visual specs (see below)


The browser application includes middleware that acts as a directory server for all paths that are not routes in the main application. For example: `http://<host>[:<port>]/lib` will serve a directory listing for the lib folder.

### Visual Specs

Visual specs help to facilitate the visual verification of behaviour which is infeasible to write automated tests for. For examples:

* An animation doesn't flicker
* A the colours scheme makes for easy reading
* A slider control is responsive when rapidly changing its position

To create a visual spec, add a jade template in the `spec/visual` directory. Any directory structure within `spec/visual` may be used to organise visual specs as you see fit. An index of available visual specs is available in the browser app.

Each slim template under `spec/visual` is a partial and will be injected into the body of a page with the src, lib and vendor javascripts loaded in the order specified by the cupfile.


Note: No style sheets are automatically loaded for visual specs.
Note: No javascripts are loaded from the `spec/visual` directory unless explicitly referenced in the `cupfile`.


### Javascripts load order, stylesheets and the `cupfile`

All javascripts and stylesheets are automatically included with the exception of javascripts within the spec/visual directory.

The loading of javascripts can be controlled using the `cupfile` with the following constraint...

Javascripts are loaded from these paths in this order:

1. vendor
2. spec (only on pages which run specs)
3. lib
4. src

Build output is referenced instead of lib and src on the relevant pages (such as when running spec on uglified build output). Only lib and src are considered build input.

