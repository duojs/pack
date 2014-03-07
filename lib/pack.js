/**
 * Module Dependencies
 */

var fs = require('fs');
var req = require('./require');
var write = require('co-write');

/**
 * Expose `pack`
 */

module.exports = pack;

/**
 * Initialize `pack`
 *
 * @param {String} path
 * @param {Object} opts
 * @return {Function}
 * @api public
 */

function pack(path, opts) {
  var stream = fs.createWriteStream(path);
  opts = opts || {};
  var first = true;
  var entries = [];
  var ids = {};
  var uid = 0;

  /**
   * Write javascript from `json` to `path`
   *
   * @param {Object} json
   * @param {Number} more
   * @api public
   */

  return function *pack(json, end) {
    if (json.entry) entries.push(json.id);
    var json = remap(json);
    var deps = JSON.stringify(json.deps || {});
    var str = json.id + ': [' + wrap(json.src) + ', ' + deps + ']';

    if (first) {
      str = req + '({\n' + str;
      first = false;
    }

    str += (end) ? '}, {}, [' + entry() + '])\n' : ',\n\n';

    yield write(stream, str);
    if (end) stream.end();
  }

  /**
   * Remap JSON file paths to uids
   *
   * @param {Object} json
   * @return {Object}
   * @api private
   */

  function remap(json) {
    json.id = id(json.id);

    for (var req in json.deps) {
      json.deps[req] = id(json.deps[req]);
    }

    return json;
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

  /**
   * Add the entrys
   *
   * @return {String}
   * @api private
   */

  function entry() {
    return entries.map(id).join(', ');
  }
}

/**
 * Wrap the source in a function
 *
 * @param {String} src
 * @return {String}
 * @api private
 */

function wrap(src) {
  var out = 'function(require, module, exports) {\n\n'
  out += src;
  out += '\n}';
  return out;
}