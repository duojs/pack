
var assert = require('assert');
var fs = require('co-fs');
var Pack = require('..');
var vm = require('vm');

describe('Pack', function(){
  it('should pack a module', function *(){
    var pack = Pack();
    var js = yield pack({ id: 'a', src: 'module.exports = "a"', deps: {} }, true);
    assert('a' == evaluate(js).require(1));
  })

  it('should pack multiple modules', function *(){
    var pack = Pack();
    var js = '';

    js += yield pack({ id: 'a', src: 'module.exports = "a"', deps: {} });
    js += yield pack({ id: 'b', src: 'module.exports = "b"', deps: { a: 'a' } }, true);

    assert('b' == evaluate(js).require(2));
  })

  it('should work with deps', function *(){
    var pack = Pack();
    var js = '';

    js += yield pack({ id: 'a', src: 'module.exports = "a"', deps: {} });
    js += yield pack({ id: 'b', src: 'module.exports = require("a")', deps: { a: 'a' } }, true);

    assert('a' == evaluate(js).require(2));
  })

  it('should stream to `path` if given', function *(){
    var pack = Pack(__dirname + '/a.js');
    var js = yield pack({ id: 'a', src: 'module.exports = "a"', deps: {} }, true);
    assert(js == (yield fs.readFile('test/a.js', 'utf8')));
    yield fs.unlink('test/a.js');
  })

  it('should expose all named modules, so we can require from outside the build', function*(){
    var pack = Pack();
    var js = '';
    js += yield pack({ name: 'boot', id: 'module', entry: true, src: 'module.exports = [require("./utils"), require("dep")]', deps: { dep: 'dep', './utils': './utils' }});
    js += yield pack({ name: 'boot-utils', id: './utils', src: 'module.exports = "utils"', deps: { dep: 'dep' }});
    js += yield pack({ name: 'dep', id: 'dep', src: 'module.exports = "dep"', deps: {} }, true);
    var require = evaluate(js).require;
    assert.deepEqual(['utils', 'dep'], require('boot'));
    assert('utils' == require('boot-utils'));
    assert('dep' == require('dep'));
  })

  it('should expose "global" to the global context', function*(){
    var pack = Pack();
    var js = '';
    js += yield pack({ id: 'module', entry: true, src: 'module.exports = "module"', deps: {}, global: 'my-module' }, true);
    var ctx = evaluate(js);
    assert('module' == ctx['my-module']);
  })

  it('should not expse any globals by default', function*(){
    var pack = Pack();
    var js = yield pack({ id: 'module', entry: true, src: 'module.exports = "module"', deps: {} }, true);
    var ctx = evaluate(js);
    var globals = Object.keys(ctx);
    assert.deepEqual(['console', 'require'], globals)
  })

  it('should not use previously defined require()s', function*(){
    var pack = Pack();
    var js = yield pack({ id: 'module', entry: true, src: 'module.exports = "module"', deps: {} }, true);
    var ctx = evaluate(js, { require: require });
    assert('module' == ctx.require(1));

    function require(){
      throw new Error('used previously defined require()');
    }
  })

  it('should not contain sourcemaps by default', function*(){
    var pack = Pack();
    var js = yield pack({ id: 'm', entry: true, src: 'module.exports = "m"', deps: {} }, true);
    assert(!~ js.indexOf('//# sourceMappingURL'));
  })

  it('should contain sourcemaps when `debug: true`', function*(){
    var pack = Pack({ debug: true });
    var js = yield pack({ id: 'm', entry: true, src: 'module.exports = "m"', deps: {} }, true);
    assert(!! ~js.indexOf('//# sourceMappingURL'));
  })
})

function evaluate(js, ctx){
  var box = ctx || { console: console };
  vm.runInNewContext('require =' + js, box, 'vm');
  return box;
}
