/**
 * Module Dependencies
 */

var path = require('path');
var co = require('co');
var join = path.join;

/**
 * Expose `Pack`
 */

module.exports = Pack;

/**
 * Build packs
 */

var packs = {
  js: require('./lib/js'),
  css: require('./lib/css')
};

/**
 * Initialize `Pack`
 *
 * @param {String} root
 * @return {Pack}
 * @api public
 */

function Pack(root) {
  if (!(this instanceof Pack)) return new Pack(root);
  this.root = root;
}

/**
 * Set the build `path`
 *
 * @param {String} path
 * @return {Pack}
 */

Pack.prototype.into = function(path) {
  this.buildPath = '/' == path[0]
    ? path
    : join(this.root, path);

  return this;
};

/**
 * Pack the assets
 *
 * @param {Object} mapping
 * @param {Function} fn (optional)
 */

Pack.prototype.pack = function(mapping, fn) {
  return fn
    ? co(this._pack).call(this, mapping, fn)
    : this._pack(mapping);
}

/**
 * Pack the assets
 *
 * @param {Object} mapping
 * @return {Pack}
 * @api public
 */

Pack.prototype._pack = function*(mapping) {
  var names = Object.keys(mapping);
  var entries = names.filter(function(name) {
    return mapping[name].entry;
  });

  var gens = {};
  var files = [];

  for (var i = 0, entry; entry = entries[i]; i++) {
    entry = mapping[entry];
    var id = entry.id;
    var type = entry.type;
    
    if (this[type]) {
      gens[id] = this[type](id, mapping, files);
    }
  }

  var srcs = yield gens;

  return srcs;
};

/**
 * Walk the dependencies
 */

Pack.prototype.walk = function(id, mapping, fn) {
  fn && fn(id);
  var deps = mapping[id].deps || {};
  for (var dep in deps) this.walk(dep, mapping, fn);
  return this;
}

/**
 * Pack javascript
 *
 * @param {String} id
 * @param {Object} mapping
 * @api private
 */

Pack.prototype.js = function*(id, mapping) {
  var req = require('./lib/js/require');
  var out
};

/**
 * Pack CSS
 *
 * @param {String} id
 * @param {Object} mapping
 * @api private
 */

Pack.prototype.css = function*(id, mapping) {
  
};
