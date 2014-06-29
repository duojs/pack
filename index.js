/**
 * Expose `Pack`
 */

module.exports = Pack;

/**
 * Initialize `Pack`
 *
 * @param {String} root
 * @param {Object} mapping
 * @return {Pack}
 * @api public
 */

function Pack(mapping) {
  if (!(this instanceof Pack)) return new Pack(mapping);
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

  // reset symlinks
  this.symlinks = {};
  
  // ensure we have a fn for type
  if (!this[type]) return false;

  // pack the source
  return this[type](dep, mapping, this);
};

/**
 * Pack Javascript
 *
 * @param {String} id
 * @param {Object} mapping
 * @api private
 */

Pack.prototype.js = require('./lib/js');

/**
 * Pack CSS
 *
 * @param {String} id
 * @param {Object} mapping
 * @api private
 */

Pack.prototype.css = require('./lib/css');
