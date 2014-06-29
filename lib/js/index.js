/**
 * Module Dependencies
 */

var reqpath = require.resolve('./require');
var sourcemap = require('./sourcemap');
var fmt = require('util').format;
var req = require('./require');
var stringify = JSON.stringify;
var ids = {};
var uid = 0;

/**
 * Expose `js`
 */

module.exports = js;

/**
 * Initialize `js`
 *
 * @param {String} entry
 * @param {Object} mapping
 * @param {Pack} pack
 * @return {Function}
 * @api public
 */

function js(entry, mapping, pack) {
  var sm = pack.develop ? sourcemap() : false;
  sm && sm.file(reqpath, req);

  var src = pkg(entry, mapping, sm);
  var ending = sm ? sm.end() : '';
  var main = {};
  main[remap(entry).id] = entry.global || '';

  return fmt('%s({\n%s}, {}, %s)\n%s', req, src, stringify(main), ending);  
}

/**
 * Package the deps
 *
 * @param {Object} dep
 * @param {Object} mapping
 * @param {Sourcemap|Boolean} sm
 * @param {Array} out
 * @return {String}
 * @api private
 */

function pkg(dep, mapping, sm, out) {
  out = out || [];
  
  var id = dep.id;
  var src = dep.src;
  var deps = dep.deps;
  var remapped = remap(dep);
  var str = fmt('%d: [%s, %s]', remapped.id, wrap(src), stringify(remapped.deps));

  out.push(str);

  // add file to sourcemap
  if (sm) sm.file(id, src, str);

  // recurse through dep's deps
  for (var d in deps) {
    pkg(mapping[deps[d]], mapping, sm, out);
  }

  return out.join(',\n'); 
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
 * Remap JSON file paths to uids
 *
 * @param {Object} dep
 * @return {Object}
 * @api private
 */

function remap(dep) {
  var out = {};

  out.id = id(dep.id);
  out.deps = {};

  for (var req in dep.deps) {
    out.deps[req] = id(dep.deps[req]);
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

function id(file) {
  return ids[file] = ids[file] || ++uid;
}
