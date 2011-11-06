# Cup

INSERT A PICTURE OF A CUP

`npm install uglify-js`: UglifyJS must be installed

Command lines tools and a web application to help in developing javascript libraries and applications independently of anything else.


## Command Line App

Output from `cup help`:

    Tasks:
      cup build          # builds and minifies (with uglifier) into ./build/
      cup concatenate    # concatenates to STDOUT
      cup create NAME    # Creates a new directory structure with the specified name. Can also be called like: cup <name> [options]
      cup help [TASK]    # Describe available tasks or one specific task
      cup ify            # cupifys the current directory, creating a Cupfile etc.
      cup minify         # minifies to STDOUT with uglifier
      cup rackup         # Create a config.ru. Do this if you want to use powder
      cup server [PORT]  # Starts a sinatra app which serves spec runners etc.
      cup version        # The version of cup and the version of the Cup project in this directory if a Cupfile exists



### The create Command

This command produces a folder containing:

* vendor: for vendor js libraries such as jquery and jasmine which are automatically downloaded. Note, the latest version of jquery is downloaded by default, for jasmine, cup currently downloaded v1.1
* spec: where you will place you carefully prepared jasmine specs ;)
* spec/visual: some special case spec (more on this in the Browser App section below)
* lib: this is where libraries to be included in the build should be placed
* src: duh.
* Cupfile: a file which is used to describe the cup project (more in the Cupfile section below)
* licence.txt: A default open source licence


## Cupfile

Sample Cupfile (ruby) with comments:

    Cup.define do

      name 'my project' # MUST be a valid file name
      version '0.0.1' # must be of the form X.Y.Z where X, Y and Z are numbers
      licence 'MIT.txt'

      javascripts do

        vendor 'only_one.js' # <-- no :* symbol means only those explicitly listed scripts will be loaded

        spec 'path/within/spec/dir.js', :* # <-- :* symbol means "all others"

        # if lib load order was not explicitly declared cup defaults to the equivalent:

        lib :*

        src [
          'an.js',
          'array.js',
          'can.js',
          'also.js',
          'be.js',
          'used.js',
          'so/can/glob-like/patterns/**/*.js'] # happily, patterns and arrays can be used too.
      end

      before_build do
        # whatever you want
      end

      after_build do
        # whatever you want
      end
    end

Note: Multiple inclusions of the same javascript result in the omission of all but the first reference

## Browser App

* root: an overview of the project including links to build output and a file list for the project
* debug: a page on which the src javascripts and vendor javascripts are loaded but no specs, good for debugging and experimenting with your code in the console
* empty: the same as debug, but a completely empty page (no cup app header or css). This is for debugging UI components withoutany interference from the stylesheets or controls in the cup application itself.
* src: run specs on the lib and src files
* concatenated: run specs on the concatenated version of build output
* minifed: run specs on the minified version of the build output
* visual: exercise visual specs (see below)


The browser application includes Rack Middleware that acts as a directory server for all paths that are not routes in the main application. For example: `http://<host>:<port>/lib` will serve a directory listing for the lib folder.

Every page on the browser application builds the javascripts. An error page is displayed to indicate the build failed and the browser is redirected to a page that loads lib and src files so that their syntax can be checked in Web Inspector or Firebug.

### Visual Specs

Visual specs help to facilitate the visual verifcation of behaviour which maybe required to support automated specs when developing UI components. Examples of visual spec criteria:

* An animation doesn't flicker
* A the colours scheme works
* A slider control is responsive when rapidly changing its position

To create a visual spec, add a slim template in the `spec/visual` directory. Any directory structure within `spec/visual` may be used to organise visual specs as you see fit. An index of available visual specs is available in the browser app.

Each slim template under `spec/visual` is a partial and will be injected into the body of a page with the src, lib and vendor javascript loaded in the order specified by the Cupfile.


Note: No style sheets are automatically loaded for visual specs.
Note: No javascripts are loaded from the `spec/visual` directory unless explicitly reference in the Cupfile.


### Javascripts load order, stylesheets and the Cupfile

All javascripts and stylesheets are automatically included with the exception of javascripts within the spec/visual directory.
SASS is automatically processed. The automatic loading of stylesheets cannot be overridden.
The loading of javascripts can be controlled using the Cupfile with the following constraint...

Javascripts are loaded from these paths in this order:

1. vendor
2. spec (only on pages which run specs)
3. lib
4. src

Build output is referenced instead of lib and src on the relevant pages (such as when running spec on minifed build output). Only lib and src (in that order) are considered build input.

