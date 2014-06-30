/**
 * Expose `Pack`
 */

module.exports = Pack;

/**
 * Default Packs
 */

var js = Pack.js = require('./lib/js');
var css = Pack.css = require('./lib/css');

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
  
  // ensure we have a fn for type
  if (!Pack[type]) return false;

  // pack the source
  return Pack[type](dep, mapping, this).toString();
};
