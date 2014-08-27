
var read = require('fs').readFileSync;
var assert = require('assert');
var fs = require('co-fs');
var Pack = require('..');
var vm = require('vm');

describe('Pack', function(){
  it('should pack a module', function (){
    var map = { 'a' : { id: 'a', type: 'js', src: 'module.exports = "a"', deps: {} }};
    var pack = Pack(map);
    var js = pack.pack('a');
    assert('a' == evaluate(js).require(1));
  })

  it('should pack multiple modules', function (){
    var map = {};
    map.a = { id: 'a', type: 'js', src: 'module.exports = "a"', deps: {} };
    map.b = { id: 'b', type: 'js', src: 'module.exports = "b"', deps: { a: 'a' } };
    var pack = Pack(map);
    var js = pack.pack('b');
    assert('b' == evaluate(js).require(1));
  })

  it('should work with deps', function (){
    var map = {};
    map.a = { id: 'a', type: 'js', src: 'module.exports = "a"', deps: {} };
    map.b = { id: 'b', type: 'js', src: 'module.exports = require("a")', deps: { a: 'a' } };
    var pack = Pack(map);
    var js = pack.pack('b');
    assert('a' == evaluate(js).require(1));
  })

  it('should expose "global" to the global context', function(){
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = "module"', deps: {}, global: 'my-module' };
    var pack = Pack(map);
    var js = pack.pack('module');
    var ctx = evaluate(js);
    assert('module' == ctx['my-module']);
  })

  it('should not expose any globals by default', function(){
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = "module"', deps: {} };
    var pack = Pack(map);
    var js = pack.pack('module');
    var ctx = evaluate(js);
    var globals = Object.keys(ctx);
    assert.deepEqual(['console', 'require'], globals)
  })

  it('should not use previously defined require()s', function(){
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = "module"', deps: {} };
    var pack = Pack(map);
    var js = pack.pack('module');
    var ctx = evaluate(js, { require: require });
    assert('module' == ctx.require(1));

    function require(){
      throw new Error('used previously defined require()');
    }
  })

  it('should not contain sourcemaps by default', function(){
    var map = {};
    map.m = { id: 'm', type: 'js', entry: true, src: 'module.exports = "m"', deps: {} }
    var pack = Pack(map);
    var js = pack.pack('m');
    assert(!~ js.indexOf('//# sourceMappingURL'));
  })

  it('should contain sourcemaps when development is set', function(){
    var map = require('./fixtures/sourcemaps');
    var expected = read(__dirname + '/fixtures/sourcemaps.out.js');
    var pack = Pack(map).development();
    var js = pack.pack('m');
    assert.equal(js.trim(), expected.toString().trim());
  })

  it('should handle css files', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "./b.css";\n\nbody {}', deps: { './b.css': 'b' }};
    map.b = { id: 'b', type: 'css', src: 'h1 { color: red; }', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('h1 { color: red; }\n\nbody {}' == css)
  })

  it('should handle empty css files', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "./b.css";\n\nbody {}', deps: { './b.css': 'b' }};
    map.b = { id: 'b', type: 'css', src: '', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('\n\nbody {}' == css)
  })

  it('should handle empty js files', function() {
    var map = {};
    map.a = { id: 'a', type: 'js', src: '', deps: {} };
    map.b = { id: 'b', type: 'js', src: 'module.exports = require("a")', deps: { a: 'a' } };
    var pack = Pack(map);
    var js = pack.pack('b');
    assert('object' == typeof evaluate(js).require(1));
  })

  it('should add copy/symlink paths for non-supported files', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: 'section { background: url("./b.png"); }', deps: { './b.png': 'b' }};
    map.b = { id: 'b', type: 'png', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('section { background: url("b"); }' == css);
  })

  it('should ignore http paths as urls', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: 'section { background: url("http://google.com"); }', deps: {}};
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('section { background: url("http://google.com"); }' == css);
  })

  it('should ignore http paths as @imports', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import url("http://google.com");', deps: {}};
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('@import url("http://google.com");' == css);
  })

  it('should only append the first @import if there are duplicates', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "./b.css";\n@import "./b.css";\n.a {}', deps: { './b.css': 'b' }};
    map.b = { id: 'b', type: 'css', src: '.b {}', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal('.b {}\n\n.a {}', css);
  })

  it('should keep duplicate assets', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: 'section { background: url("./b.png"); } main { background: url("./b.png"); }', deps: { './b.png': 'b' }};
    map.b = { id: 'b.png', type: 'png', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('section { background: url("b.png"); } main { background: url("b.png"); }' == css);
  })

  it('should not duplicate when deps points to the same thing', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "logo/logo";\n@import "logo/logo@*";\n.a {}', deps: { 'logo/logo': 'logo', 'logo/logo@*': 'logo' }};
    map.logo = { id: 'logo', type: 'css', src: '.logo {}', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal('.logo {}\n\n.a {}', css);
  })
})

function evaluate(js, ctx){
  var box = ctx || { console: console };
  vm.runInNewContext('require =' + js, box, 'vm');
  return box;
}
