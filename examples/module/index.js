
/**
 * Module Dependencies
 */

var Pack = require('../../');
var path = require('path');
var fs = require('fs');
var join = path.join;

/**
 * Paths
 */

var out = join(__dirname, 'build.js');
var mapping = require(join(__dirname, 'components', 'duo.json'));

/**
 * Initialize `duo-pack`
 */

var pack = Pack(__dirname)
  .into('build')

/**
 * Run `pack`
 */

pack.pack(mapping, function(err, src) {
  if (err) throw err;
  console.log(src);
});
