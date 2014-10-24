/**
 * Module Dependencies
 */

var reqpath = require.resolve('./require');
var sourcemap = require('./sourcemap');
var fmt = require('util').format;
var req = require('./require');
var stringify = JSON.stringify;
var umd = require('./umd');
var ids = {};
var uid = 0;

/**
 * Expose `JS`
 */

module.exports = JS;

/**
 * Initialize `JS`
 *
 * @param {String} entry
 * @param {Object} mapping
 * @param {Pack} pack
 * @return {Function}
 * @api public
 */

function JS(entry, mapping, pack) {
  if (!(this instanceof JS)) return new JS(entry, mapping, pack);
  this.sm = pack.develop ? sourcemap() : false;
  this.mapping = mapping;
  this.opts = pack.opts;
  this.entry = entry;
  this.pack = pack;
  this.ids = {};
  this.uid = 0;
}

/**
 * Compile the mapping to a string
 *
 * @return {String}
 * @api public
 */

JS.prototype.toString = function() {
  var str = '%s({\n%s}, {}, %s)\n%s';
  var entry = this.entry;
  // source map + src
  var sm = this.sm;
  sm && sm.file('require.js', req);

  // build the source
  var src = this.pkg(this.entry);

  // global support
  var id = this.remap(this.entry).id;
  var m = {};
  m[id] = entry.global || '';

  // umd support.
  if (this.opts.umd && this.entry.name) {
    str = fmt('%s(%s);', umd
      .replace(/:entry/g, this.entry.name)
      .replace(/:id/g, id)
      , str);
  }

  return fmt(str, req, join(src), stringify(m), sm ? sm.end() : '');
};


/**
 * Package the deps
 *
 * @param {Object} dep
 * @param {Object} out (private)
 * @return {String}
 * @api private
 */

JS.prototype.pkg = function(dep, out) {
  out = out || {};

  if (out[dep.id]) return out;

  var id = dep.id;
  var sm = this.sm;
  var src = dep.src;
  var deps = dep.deps;
  var remapped = this.remap(dep);
  var str = fmt('%d: [%s, %s]', remapped.id, wrap(src), stringify(remapped.deps));

  // add to out
  out[id] = str;

  // add file to sourcemap
  sm && sm.file(id, src, str);

  // recurse through dep's deps
  for (var d in deps) {
    this.pkg(this.mapping[deps[d]], out);
  }

  return out;
}

/**
 * Remap JSON file paths to uids
 *
 * @param {Object} dep
 * @return {Object}
 * @api private
 */

JS.prototype.remap = function(dep) {
  var out = {};

  out.id = this.id(dep.id);
  out.deps = {};

  for (var req in dep.deps) {
    out.deps[req] = this.id(dep.deps[req]);
  }

  return out;
}

/**
 * Get or set the uid
 *
 * @param {String} file
 * @return {Number}
 * @api private
 */

JS.prototype.id = function(file) {
  return this.ids[file] = this.ids[file] || ++this.uid;
}

/**
 * Wrap the source in a function
 *
 * @param {String} src
 * @return {String}
 * @api private
 */

function wrap(src) {
  return fmt('function(require, module, exports) {\n%s\n}', src);
}

/**
 * Join the sources
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function join(obj) {
  var out = [];
  for (var id in obj) out.push(obj[id]);
  return out.join(',\n');
}
