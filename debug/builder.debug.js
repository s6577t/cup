var Cup     = require('../'),
    Builder = Cup.Builder;

var cup = new Cup('./test/eventify');
var builder = new Builder(cup);

console.info(builder.build());