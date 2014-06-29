
/**
 * Module Dependencies
 */

var Pack = require('../../');
var path = require('path');
var fs = require('fs');
var join = path.join;

/**
 * Paths
 */

var mapping = require(join(__dirname, 'components', 'duo.json'));

/**
 * Initialize `duo-pack`
 */

var pack = Pack(__dirname, mapping);

/**
 * Run `pack`
 */

var src = pack.pack('main.css');

// console.log(src);
// console.log(pack.symlinks);
// /**
//  * Module Dependencies
//  */

// var assert = require('assert');
// var Duo = require('../../');
// var styl = require('styl');


// // var duo = Duo(__dirname).entry('main.css');

// // duo.use(function*(file){
// //   if ('styl' != file.type) return;
// //   file.src = styl(file.src, { whitespace: true }).toString();
// //   file.type = 'css';
// // });

// // duo.run(function(err, str) {
// //   if (err) throw err;
// //   console.log('all done!');
// //   console.log(str);
// // });


// var fs = require('fs');
// var mapping = require('./components/duo.json');
// var filedeps = require('file-deps');

// function build(dep, pack) {
//   var deps = dep.deps;
//   var src = dep.src;
//   var srcs = {};

//   // pull in all the sources
//   for (var d in deps) {
//     srcs[d] = build(mapping[deps[d]]);
//   }

//   // symlink
//   if (!dep.src) {
//     // console.log(dep.id);
//     return false;
//   }

//   var src = filedeps(src, 'css', function(d) {
//     if (srcs[d]) return srcs[d];
//   });

//   return src;
// }


// var src = build(mapping['main.css']);
// fs.writeFile('./build.css', src, 'utf8');
