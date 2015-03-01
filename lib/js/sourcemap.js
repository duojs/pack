/**
 * Module dependencies
 */

var sourcemap = require('combine-source-map');

/**
 * Export `Sourcemap`
 */

module.exports = Sourcemap;

/**
 * Initialize `Sourcemap`
 */

function Sourcemap() {
  if (!(this instanceof Sourcemap)) return new Sourcemap();
  this.sm = sourcemap.create();
  this.lineno = 0;
}

/**
 * Add a file
 *
 * @param {String} file
 * @param {String} src
 * @api public
 */

Sourcemap.prototype.file = function(file, src, wrapped) {
  var offset = wrapperOffset(src, wrapped);
  this.sm.addFile({ sourceFile: '/duo/' + file, source: src }, { line: this.lineno + offset });
  this.lineno += lineno(wrapped || src);
};

/**
 * End the sourcemap
 *
 * @return {String}
 * @api public
 */

Sourcemap.prototype.end = function() {
  return '\n' + this.sm.comment();
};

/**
 * Get the number of lines
 *
 * @param {String} src
 * @return {Number}
 * @api private
 */

function lineno(src) {
  if (!src) return 0;
  var m = src.match(/\n/g);
  return m ? m.length + 1: 0;
}

/**
 * Get the number of lines prepended by wrapper
 *
 * @param {String} src
 * @param {String} wrapper
 * @return {Number}
 * @api private
 */

function wrapperOffset(src, wrapped) {
  if (!src || (src && !wrapped)) return 0;
  return wrapped.substr(0, wrapped.indexOf(src)).match(/\n/g).length;
}
