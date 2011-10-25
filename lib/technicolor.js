module.exports = (function () {

  var colors = {
    black: '30m',
    red: '31m',
    green: '32m',
    yellow: '33m',
    blue: '34m',
    purple: '35m',
    cyan: '36m',
    darkGrey: '37m',
    lightGrey: '90m',
    brightRed: '91m',
    brightGreen: '92m',
    brightYellow: '93m',
    brightBlue: '94m',
    brightPurple: '95m',
    brightCyan: '96m',
    white: '97m'
  }

  var backgroundColors = {
    black: '40m',
    red: '41m',
    green: '42m',
    yellow: '43m',
    blue: '44m',
    purple: '45m',
    cyan: '46m',
    darkGrey: '47m',
    lightGrey: '100m',
    brightRed: '101m',
    brightGreen: '102m',
    brightYellow: '103m',
    brightBlue: '104m',
    brightPurple: '105m',
    brightCyan: '106m',
    white: '107m'
  };

  function technicolor (string, options) {

    var shColor = "\033[COLOUR",
    shBackground = "\033[BACKGROUND",
    end = "\033[0m"

    var buffer = "";

    if (options.bold) buffer += "\033[1m";
    if (options.underline) buffer += "\033[4m";

    var color = colors[options.color];
    if (color) buffer += shColor.replace('COLOUR', color);

    var background = backgroundColors[options.backgroundColor];
    if (background) buffer += shBackground.replace('BACKGROUND', background);

    return buffer + string + end;
  }

  technicolor.colors = colors;
  technicolor.backgroundColors = backgroundColors;
  
  technicolor.showAll = function () {
    for (var color in colors) {

      var combination = "#color text on the current background"
        .replace('#color', color);

      console.info(technicolor(combination, {
        color: color
      }));

      combination = "#color text bold and underlined"
      .replace('#color', color)
      .replace('#backgroundColor', backgroundColor);

      console.info(technicolor(combination, {
        color: color,
        bold: true,
        underline: true
      }));

      for (var backgroundColor in backgroundColors) {

        combination = "#color text on a #backgroundColor background"
        .replace('#color', color)
        .replace('#backgroundColor', backgroundColor);

        console.info(technicolor(combination, {
          color: color,
          backgroundColor: backgroundColor
        }));
      }
    }
  }
  
  return technicolor;
})();
