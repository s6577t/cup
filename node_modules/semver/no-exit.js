
;(function () {

var gen = +(process.argv[2] || 0);
var maxGen = 5;


if (gen === maxGen) {
  console.log("hit maxGen, exiting", maxGen);
  return;
}

var ch = require("child_process");
var cp = ch.spawn("node", [__filename, gen + 1]);

console.log("gen=%d", gen);

var timer = setTimeout(function () {
  console.error(cp.stdout)
  throw new Error("timeout! gen="+gen);
}, 10000);

process.on("exit", function (code) {
  console.error("exiting %d with code %d", gen, code || 0);
});

cp.on("exit", function (code) {
  console.error("exit %d from gen %d", code, gen + 1);
  clearTimeout(timer);
})

cp.stdout.pipe(process.stdout);
cp.stderr.pipe(process.stderr);

})();
