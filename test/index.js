
var convert = require('convert-source-map');
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
    assert('a' == evaluate(js.code).require(1));
  })

  it('should pack multiple modules', function (){
    var map = {};
    map.a = { id: 'a', type: 'js', src: 'module.exports = "a"', deps: {} };
    map.b = { id: 'b', type: 'js', src: 'module.exports = "b"', deps: { a: 'a' } };
    var pack = Pack(map);
    var js = pack.pack('b');
    assert('b' == evaluate(js.code).require(1));
  })

  it('should work with deps', function (){
    var map = {};
    map.a = { id: 'a', type: 'js', src: 'module.exports = "a"', deps: {} };
    map.b = { id: 'b', type: 'js', src: 'module.exports = require("a")', deps: { a: 'a' } };
    var pack = Pack(map);
    var js = pack.pack('b');
    assert('a' == evaluate(js.code).require(1));
  })

  it('should expose "global" to the global context', function(){
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = "module"', deps: {}, global: 'my-module' };
    var pack = Pack(map);
    var js = pack.pack('module');
    var ctx = evaluate(js.code);
    assert('module' == ctx['my-module']);
  })

  it('should not expose any globals by default', function(){
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = "module"', deps: {} };
    var pack = Pack(map);
    var js = pack.pack('module');
    var ctx = evaluate(js.code);
    var globals = Object.keys(ctx);
    assert.deepEqual(['console', 'require'], globals)
  })

  it('should support umd (amd)', function(){
    var defs = [];
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = [];', deps: {}, name: 'module' };
    var define = defs.push.bind(defs);
    define.amd = true;
    var pack = Pack(map, { umd: true });
    var js = pack.pack('module');
    var ctx = evaluate(js.code, { define: define });
    assert(Array.isArray(defs[0]()));
  })

  it('should support umd (commonjs by seajs)', function(){
    var defs = [];
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = [];', deps: {}, name: 'module' };
    var define = defs.push.bind(defs);
    define.cmd = true;
    var pack = Pack(map, { umd: true });
    var js = pack.pack('module');
    var ctx = evaluate(js.code, { define: define });
    assert(Array.isArray(defs[0]()));
  })

  it('should support umd (commonjs)', function(){
    var mod = { exports: {} };
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = []', deps: {}, name: 'module' };
    var pack = Pack(map, { umd: true });
    var js = pack.pack('module');
    var ctx = evaluate(js.code, { module: mod, exports: mod.exports });
    assert(Array.isArray(ctx.module.exports));
  });

  it('should support umd (global)', function(){
    var global = {};
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = []', deps: {}, name: 'module' };
    var pack = Pack(map, { umd: true });
    var js = pack.pack('module');
    var ctx = evaluate(js.code, global);
    assert(Array.isArray(ctx.module));
  });

  it('should not use previously defined require()s', function(){
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = "module"', deps: {} };
    var pack = Pack(map);
    var js = pack.pack('module');
    var ctx = evaluate(js.code, { require: require });
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
    assert(!js.map);
  })

  it('should contain sourcemaps when sourceMap is set', function(){
    var map = require('./fixtures/sourcemaps');
    var js = Pack(map).sourceMap(true).pack('m');
    assert(map.m.src == js.map.sourcesContent[js.map.sources.indexOf('/duo/m')]);
  })

  it('should append an inline source-map to code when sourceMap is "inline"', function () {
    var map = require('./fixtures/sourcemaps');
    var js = Pack(map).sourceMap('inline').pack('m');
    var sourceMap = convert.fromSource(js.code).toObject();
    assert(map.m.src == sourceMap.sourcesContent[sourceMap.sources.indexOf('/duo/m')]);
  });

  it('should handle css files', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "./b.css";\n\nbody {}', deps: { './b.css': 'b' }};
    map.b = { id: 'b', type: 'css', src: 'h1 { color: red; }', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('h1 { color: red; }\n\nbody {}' == css.code)
  })

  it('should handle empty css files', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "./b.css";\n\nbody {}', deps: { './b.css': 'b' }};
    map.b = { id: 'b', type: 'css', src: '', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('\n\nbody {}' == css.code)
  })

  it('should handle empty js files', function() {
    var map = {};
    map.a = { id: 'a', type: 'js', src: '', deps: {} };
    map.b = { id: 'b', type: 'js', src: 'module.exports = require("a")', deps: { a: 'a' } };
    var pack = Pack(map);
    var js = pack.pack('b');
    assert('object' == typeof evaluate(js.code).require(1));
  })

  it('should add copy/symlink paths for non-supported files', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: 'section { background: url("./b.png"); }', deps: { './b.png': 'b' }};
    map.b = { id: 'b', type: 'png', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('section { background: url("b"); }' == css.code);
  })

  it('should ignore http paths as urls', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: 'section { background: url("http://google.com"); }', deps: {}};
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('section { background: url("http://google.com"); }' == css.code);
  })

  it('should ignore http paths as @imports', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import url("http://google.com");', deps: {}};
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('@import url("http://google.com");' == css.code);
  })

  it('should only append the first @import if there are duplicates', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "./b.css";\n@import "./b.css";\n.a {}', deps: { './b.css': 'b' }};
    map.b = { id: 'b', type: 'css', src: '.b {}', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal('.b {}\n\n.a {}', css.code);
  })

  it('should keep duplicate assets', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: 'section { background: url("./b.png"); } main { background: url("./b.png"); }', deps: { './b.png': 'b' }};
    map.b = { id: 'b.png', type: 'png', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert('section { background: url("b.png"); } main { background: url("b.png"); }' == css.code);
  })

  it('should not duplicate when deps points to the same thing', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "logo/logo";\n@import "logo/logo@*";\n.a {}', deps: { 'logo/logo': 'logo', 'logo/logo@*': 'logo' }};
    map.logo = { id: 'logo', type: 'css', src: '.logo {}', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal('.logo {}\n\n.a {}', css.code);
  })

  it('should not duplicate deps across local files', function() {
    var map = {};
    map['one.css'] = { id: 'one.css', type: 'css', src: '@import "./two.css"; div { content: "one"; }', deps: { './two.css': 'two.css' } };
    map['two.css'] = { id: 'two.css', type: 'css', src: 'div { content: "two"; }' };
    map['index.css'] = { id: 'index.css', type: 'css', entry: true, src: '@import "./one.css"; @import "./two.css";', deps: { './one.css': 'one.css', './two.css': 'two.css' } };
    var pack = Pack(map);
    var css = pack.pack('index.css');
    assert.equal('div { content: "two"; } div { content: "one"; }', css.code.trim());
  })

  it('should make css assets relative to the entry', function() {
    var map = {};
    map['some/dir/a'] = { id: 'some/dir/a', type: 'css', entry: true, src: 'section { background: url("./images/b.png"); }', deps: { './images/b.png': 'some/dir/images/b.png' }};
    map['some/dir/images/b.png'] = { id: 'some/dir/images/b.png', type: 'png', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('some/dir/a');
    assert.equal('section { background: url("images/b.png"); }', css.code);
  })

  it('should not cache broken packages', function() {
    var map = require('./fixtures/error-cache');
    var pack = Pack(map);
    var js = pack.pack('a');

    var ret = evaluate(js.code).require(1);
    assert.strictEqual(ret.b1, ret.b2);
  })
})

function evaluate(js, ctx){
  var box = ctx || { console: console };
  vm.runInNewContext('require =' + js, box, 'vm');
  return box;
}
