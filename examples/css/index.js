
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

var mapping = require(join(__dirname, 'components', 'duo.json'));

/**
 * Initialize `duo-pack`
 */

var pack = Pack(__dirname, mapping)
  .development();

/**
 * Run `pack`
 */

var src = pack.pack('main.css');
console.log(src);
