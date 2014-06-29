/**
 * Module dependencies
 */

var filedeps = require('file-deps');

/**
 * Export `css`
 */

module.exports = css;

/**
 * Initialize `css`
 */

function css(dep, mapping, pack) {
  var deps = dep.deps;
  var src = dep.src;
  var srcs = {};

  // pull in all the sources
  for (var d in deps) {
    srcs[d] = css(mapping[deps[d]], mapping, pack);
  }

  // symlink
  if (!dep.src) {
    return pack.symlink(dep.id);
  }

  var src = filedeps(src, 'css', function(d) {
    if (srcs[d]) return srcs[d];
  });

  return src;
}

