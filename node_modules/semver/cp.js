
var ch = require("child_process")
  , cp = ch.spawn("node", ["semver.js"])

cp.on("exit", function (code) {
  console.error("exit", code)
})
cp.stdout.pipe(process.stdout)
cp.stderr.pipe(process.stderr)
