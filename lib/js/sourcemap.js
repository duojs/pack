/**
 * Module dependencies
 */

var sourcemap = require('combine-source-map');

/**
 * Sourcemap regex
 */

var rsourcemap = /^[ \t]*\/\/[@#][ \t]+sourceMappingURL=data:(?:application|text)\/json;base64,(.+)/mg;
rsourcemap.lastIndex = 0;

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
  src = src.replace(rsourcemap, '');
  this.sm.addFile({ sourceFile: file, source: src }, { line: this.lineno });
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
