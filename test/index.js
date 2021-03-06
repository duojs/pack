
var convert = require('convert-source-map');
var assert = require('assert');
var Pack = require('..');
var vm = require('vm');

describe('Pack', function(){
  it('should pack a module', function (){
    var map = { 'a': { id: 'a', type: 'js', src: 'module.exports = "a"', deps: {} }};
    var pack = Pack(map);
    var js = pack.pack('a');
    assert.equal(evaluate(js.code).require(1), 'a');
  });

  it('should pack multiple modules', function (){
    var map = {};
    map.a = { id: 'a', type: 'js', src: 'module.exports = "a"', deps: {} };
    map.b = { id: 'b', type: 'js', src: 'module.exports = "b"', deps: { a: 'a' } };
    var pack = Pack(map);
    var js = pack.pack('b');
    assert.equal(evaluate(js.code).require(1), 'b');
  });

  it('should work with deps', function (){
    var map = {};
    map.a = { id: 'a', type: 'js', src: 'module.exports = "a"', deps: {} };
    map.b = { id: 'b', type: 'js', src: 'module.exports = require("a")', deps: { a: 'a' } };
    var pack = Pack(map);
    var js = pack.pack('b');
    assert.equal(evaluate(js.code).require(1), 'a');
  });

  it('should expose "global" to the global context', function(){
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = "module"', deps: {}, global: 'my-module' };
    var pack = Pack(map);
    var js = pack.pack('module');
    var ctx = evaluate(js.code);
    assert.equal(ctx['my-module'], 'module');
  });

  it('should not expose any globals by default', function(){
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = "module"', deps: {} };
    var pack = Pack(map);
    var js = pack.pack('module');
    var ctx = evaluate(js.code);
    var globals = Object.keys(ctx);
    assert.deepEqual(['console', 'require'], globals);
  });

  it('should support umd (amd)', function(){
    var defs = [];
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = [];', deps: {}, name: 'module' };
    var define = defs.push.bind(defs);
    define.amd = true;
    var pack = Pack(map, { umd: true });
    var js = pack.pack('module');
    evaluate(js.code, { define: define });
    assert(Array.isArray(defs[0]()));
  });

  it('should support umd (commonjs by seajs)', function(){
    var defs = [];
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = [];', deps: {}, name: 'module' };
    var define = defs.push.bind(defs);
    define.cmd = true;
    var pack = Pack(map, { umd: true });
    var js = pack.pack('module');
    evaluate(js.code, { define: define });
    assert(Array.isArray(defs[0]()));
  });

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
    assert.equal(ctx.require(1), 'module');

    function require(){
      throw new Error('used previously defined require()');
    }
  });

  it('should not contain sourcemaps by default', function(){
    var map = {};
    map.m = { id: 'm', type: 'js', entry: true, src: 'module.exports = "m"', deps: {} };
    var pack = Pack(map);
    var js = pack.pack('m');
    assert(!js.map);
  });

  it('should reference an external source-map', function(){
    var map = require('./fixtures/sourcemaps');
    var js = Pack(map).sourceMap(true).pack('m');

    // should link from code to map
    assert(/\/\/# sourceMappingURL=m\.map$/.test(js.code));

    // should include external map source
    var sourceMap = convert.fromJSON(js.map).toObject();
    assert.equal(sourceMap.sourceRoot, '/duo');
    assert.equal(map.m.src, sourceMap.sourcesContent[sourceMap.sources.indexOf('/m')]);
  });

  it('should reference the external source-map via relative path', function(){
    var mapping = {};
    mapping['a/b/c.js'] = { id: 'a/b/c.js', type: 'js', entry: true, src: 'module.exports = true;', deps: {} };
    var js = Pack(mapping).sourceMap(true).pack('a/b/c.js');

    // should link from code to map
    assert(/\/\/# sourceMappingURL=c\.js\.map$/.test(js.code));
  });

  it('should append an inline source-map to code when sourceMap is "inline"', function(){
    var map = require('./fixtures/sourcemaps');
    var js = Pack(map).sourceMap('inline').pack('m');
    var sourceMap = convert.fromSource(js.code).toObject();
    assert.equal(sourceMap.sourceRoot, '/duo');
    assert.equal(map.m.src, sourceMap.sourcesContent[sourceMap.sources.indexOf('/m')]);
  });

  it('should handle css files', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "./b.css";\n\nbody {}', deps: { './b.css': 'b' }};
    map.b = { id: 'b', type: 'css', src: 'h1 { color: red; }', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal(css.code, 'h1 { color: red; }\n\nbody {}');
  });

  it('should handle empty css files', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "./b.css";\n\nbody {}', deps: { './b.css': 'b' }};
    map.b = { id: 'b', type: 'css', src: '', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal(css.code, '\n\nbody {}');
  });

  it('should handle empty js files', function() {
    var map = {};
    map.a = { id: 'a', type: 'js', src: '', deps: {} };
    map.b = { id: 'b', type: 'js', src: 'module.exports = require("a")', deps: { a: 'a' } };
    var pack = Pack(map);
    var js = pack.pack('b');
    assert.equal(typeof evaluate(js.code).require(1), 'object');
  });

  it('should add copy/symlink paths for non-supported files', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: 'section { background: url("./b.png"); }', deps: { './b.png': 'b' }};
    map.b = { id: 'b', type: 'png', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal(css.code, 'section { background: url("b"); }');
  });

  it('should ignore http paths as urls', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: 'section { background: url("http://google.com"); }', deps: {}};
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal(css.code, 'section { background: url("http://google.com"); }');
  });

  it('should ignore http paths as @imports', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import url("http://google.com");', deps: {}};
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal(css.code, '@import url("http://google.com");');
  });

  it('should only append the first @import if there are duplicates', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "./b.css";\n@import "./b.css";\n.a {}', deps: { './b.css': 'b' }};
    map.b = { id: 'b', type: 'css', src: '.b {}', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal(css.code, '.b {}\n\n.a {}');
  });

  it('should keep duplicate assets', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: 'section { background: url("./b.png"); } main { background: url("./b.png"); }', deps: { './b.png': 'b' }};
    map.b = { id: 'b.png', type: 'png', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal(css.code, 'section { background: url("b.png"); } main { background: url("b.png"); }');
  });

  it('should not duplicate when deps points to the same thing', function() {
    var map = {};
    map.a = { id: 'a', type: 'css', entry: true, src: '@import "logo/logo";\n@import "logo/logo@*";\n.a {}', deps: { 'logo/logo': 'logo', 'logo/logo@*': 'logo' }};
    map.logo = { id: 'logo', type: 'css', src: '.logo {}', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('a');
    assert.equal(css.code, '.logo {}\n\n.a {}');
  });

  it('should not duplicate deps across local files', function() {
    var map = {};
    map['one.css'] = { id: 'one.css', type: 'css', src: '@import "./two.css"; div { content: "one"; }', deps: { './two.css': 'two.css' } };
    map['two.css'] = { id: 'two.css', type: 'css', src: 'div { content: "two"; }' };
    map['index.css'] = { id: 'index.css', type: 'css', entry: true, src: '@import "./one.css"; @import "./two.css";', deps: { './one.css': 'one.css', './two.css': 'two.css' } };
    var pack = Pack(map);
    var css = pack.pack('index.css');
    assert.equal(css.code.trim(), 'div { content: "two"; } div { content: "one"; }');
  });

  it('should make css assets relative to the entry', function() {
    var map = {};
    map['some/dir/a'] = { id: 'some/dir/a', type: 'css', entry: true, src: 'section { background: url("./images/b.png"); }', deps: { './images/b.png': 'some/dir/images/b.png' }};
    map['some/dir/images/b.png'] = { id: 'some/dir/images/b.png', type: 'png', deps: {} };
    var pack = Pack(map);
    var css = pack.pack('some/dir/a');
    assert.equal(css.code, 'section { background: url("images/b.png"); }');
  });

  it('should not cache broken packages', function() {
    var map = require('./fixtures/error-cache');
    var pack = Pack(map);
    var js = pack.pack('a');

    var ret = evaluate(js.code).require(1);
    assert.strictEqual(ret.b1, ret.b2);
  });

  it('should support circular dependencies', function(){
    var map = require('./fixtures/circular');
    var pack = new Pack(map);
    var js = pack.pack('A');
    evaluate(js.code);
  });
});

function evaluate(js, ctx){
  var box = ctx || { console: console };
  vm.runInNewContext('require =' + js, box, 'vm');
  return box;
}
