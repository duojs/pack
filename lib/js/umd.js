/* eslint-env amd */

/**
 * Expose `umd`
 */

module.exports = (function(){
  return '(' + umd + ')';
})();

/**
 * UMD.
 */

function umd(require){
  if (typeof exports === 'object') {
    module.exports = require(':id');
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(function(){ return require(':id'); });
  } else {
    this[':entry'] = require(':id');
  }
}
