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
  this.lineno = 0;
  this.sm = sourcemap.create();
}

/**
 * Add a file
 *
 * @param {String} file
 * @param {String} src
 * @api public
 */

Sourcemap.prototype.file = function(file, src, wrapped) {
  src = src.replace(rsourcemap, '');
  this.lineno += lineno(wrapped);
  this.sm.addFile({ sourceFile: file, source: src }, { line: this.lineno });
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
  return m ? m.length : 0;
}
