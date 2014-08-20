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
  return this.pkg(this.entry);
};

/**
 * Package the deps
 *
 * @param {Object} dep
 * @param {Object} out (private)
 * @return {String}
 * @api private
 */

CSS.prototype.pkg = function(dep, out) {
  out = out || {};

  var mapping = this.mapping;
  var deps = dep.deps;
  var src = dep.src;

  // pull in all the sources
  // TODO: fix for infinite recursion
  for (var d in deps) {
    out[d] = this.pkg(mapping[deps[d]], out);
  }

  // replace url(...) with relative path
  if (undefined == dep.src) return dep.id;

  // replace @import and url(...)
  var src = filedeps(src, 'css', function(d) {
    var val = out[d];
    out[d] = ''; // we've used it up, don't append again
    return val;
  });

  return src;
};
