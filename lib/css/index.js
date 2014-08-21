/**
 * Module dependencies
 */

var filedeps = require('file-deps');

/**
 * Export `CSS`
 */

module.exports = CSS;

/**
 * Initialize `CSS`
 *
 * @param {Strign} entry
 * @param {Object} mapping
 * @param {Pack} pack
 * @return {CSS}
 * @api public
 */

function CSS(entry, mapping, pack) {
  if (!(this instanceof CSS)) return new CSS(entry, mapping, pack);
  this.mapping = mapping;
  this.entry = entry;
  this.pack = pack;
}

/**
 * Compile the mapping to a string
 *
 * @return {String}
 * @api public
 */

CSS.prototype.toString = function() {
  return this.pkg(this.entry).value;
};

/**
 * Package the deps
 *
 * @param {Object} dep
 * @param {Object} tokens (private)
 * @return {String}
 * @api private
 */

CSS.prototype.pkg = function(dep, tokens) {
  tokens = tokens || {};

  var mapping = this.mapping;
  var deps = dep.deps;
  var src = dep.src;

  // pull in all the sources
  // TODO: fix for infinite recursion
  for (var d in deps) {
    tokens[d] = this.pkg(mapping[deps[d]], tokens);
  }

  // replace url(...) with relative path
  if (undefined == dep.src) {
    return this.asset(dep.id);
  }

  // replace @import and url(...)
  src = filedeps(src, 'css', function(d) {
    var token = tokens[d] || {};
    var val = token.value;

    // only include source once, but include assets many times
    if ('source' == token.type) tokens[d].value = '';

    return val;
  });

  return this.source(src);
};

/**
 * Create a `asset` token
 *
 * @param {String} value
 * @return {Object}
 * @api private
 */

CSS.prototype.asset = function(value) {
  return { type: 'asset', value: value };
}

/**
 * Create a `source` token
 *
 * @param {String} value
 * @return {Object}
 * @api private
 */

CSS.prototype.source = function(value) {
  return { type: 'source', value: value };
}
