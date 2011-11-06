# Technicolor

Use node to remind you of Teletext.

## Install

    npm install technicolor

## Use

    var technicolor = require('technicolor');

    var message = "Hello, Darling."
    var prettyMessage = technicolor(message, {
      color           : 'red',
      backgroundColor : 'white',
      bold            : true,
      underline       : true
    });

    console.info(prettyMessage);

![](https://raw.github.com/sjltaylor/technicolor/master/hello_darling.png)

## Possibilities

    var technicolor = require('technicolor');
    technicolor.showAll();

![](https://raw.github.com/sjltaylor/technicolor/master/show_all.png)
## Supported Colours

* black
* red
* green
* yellow
* blue
* purple
* cyan
* darkGrey
* lightGrey
* brightRed
* brightGreen
* brightYellow
* brightBlue
* brightPurple
* brightCyan
* white