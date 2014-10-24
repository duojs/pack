/**
 * Expose `Pack`
 */

module.exports = Pack;

/**
 * Default Packs
 */

var js = Pack.js = require('./js');
var css = Pack.css = require('./css');

/**
 * Initialize `Pack`
 *
 * @param {Object} mapping
 * @param {Object} opts
 * @return {Pack}
 * @api public
 */

function Pack(mapping, opts) {
  if (!(this instanceof Pack)) return new Pack(mapping, opts);
  this.opts = opts || {};
  this.mapping = mapping;
  this.develop = false;
}

/**
 * Development
 *
 * @param {Boolean} develop
 * @return {Pack}
 * @api public
 */

Pack.prototype.development = function(develop) {
  this.develop = undefined == develop ? true : develop;
  return this;
};

/**
 * Pack the assets
 *
 * @param {String} entry
 * @return {Pack}
 * @api public
 */

Pack.prototype.pack = function(entry) {
  var mapping = this.mapping;
  var dep = mapping[entry];
  var type = dep.type;

  // ensure we have a fn for type
  if (!Pack[type]) return false;

  // pack the source
  return Pack[type](dep, mapping, this).toString();
};
