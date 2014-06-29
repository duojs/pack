
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
    assert('b' == evaluate(js).require(2));
  })

  it('should work with deps', function (){
    var map = {};
    map.a = { id: 'a', type: 'js', src: 'module.exports = "a"', deps: {} };
    map.b = { id: 'b', type: 'js', src: 'module.exports = require("a")', deps: { a: 'a' } };
    var pack = Pack(map);
    var js = pack.pack('b');
    assert('a' == evaluate(js).require(2));
  })

  it('should expose "global" to the global context', function(){
    var map = {};
    map.module = { id: 'module', type: 'js', entry: true, src: 'module.exports = "module"', deps: {}, global: 'my-module' };
    var pack = Pack(map);
    var js = pack.pack('module');
    var ctx = evaluate(js);
    assert('module' == ctx['my-module']);
  })

  it('should not expse any globals by default', function(){
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
    assert('module' == ctx.require(3));

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
    var map = {};
    map.m = { id: 'm', type: 'js', entry: true, src: 'module.exports = "m"', deps: {} };
    var pack = Pack(map).development();
    var js = pack.pack('m');
    assert(!! ~js.indexOf('//# sourceMappingURL'));
  })
})

function evaluate(js, ctx){
  var box = ctx || { console: console };
  vm.runInNewContext('require =' + js, box, 'vm');
  return box;
}
