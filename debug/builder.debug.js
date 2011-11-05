var Cup     = require('../'),
    Builder = Cup.Builder;

var cup = new Cup('./test/eventify');
var builder = new Builder(cup);

var r = builder.build();

delete r.uglify['output'];
delete r.concatenate['output'];

console.info(r);