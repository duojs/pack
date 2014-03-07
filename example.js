/**
 * Module Dependencies
 */

var co = require('co');
var Pack = require('./');

co(function *() {
  var pack = Pack('build.js');
  yield pack({ id: 'a', src: 'module.exports = "hi there"', deps: { 'b': 'b' }});
  yield pack({ id: 'b', src: 'module.exports = "whatever"', deps: {}}, true);
})(done);

function done(err) {
  if (err) console.log(err);;
  console.log('all packed!');
}
