var stream = require("stream")
var util = require("util")

function Piper() {}
util.inherits(Piper, stream.Stream)
Piper.prototype.write = function (c) {
  console.error("data", c)
  this.emit("data", c)
}
Piper.prototype.end = function () {
  this.emit("end")
}

var pied = new Piper
pied.pipe(process.stdout)
pied.write("yo")
setTimeout(function () {
  console.error("step 2", c)
pied.write("ho ho")
setTimeout(function () {
pied.end()
}) })
