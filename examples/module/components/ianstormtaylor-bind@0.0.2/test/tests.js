describe('bind', function () {

var assert = require('assert')
  , bind = require('bind');

it('should bind a function', function () {
  var fn = function () { return this; };
  var bound = bind(42, fn);
  assert(fn() == window);
  assert(bound() == 42);
});

describe('#all', function () {
  it('should bind all methods', function () {
    var obj = {
      one: function () { return this; },
      two: function () { return this; }
    };
    bind.all(obj);
    assert(obj.one() == obj);
    assert(obj.two() == obj);
    assert(obj.one.call(42) == obj);
    assert(obj.two.call(42) == obj);
  });
});

describe('#methods', function () {
  it('should bind certain methods', function () {
    var obj = {
      one: function () { return this; },
      two: function () { return this; }
    };
    bind.methods(obj, 'one');
    assert(obj.one() == obj);
    assert(obj.two() == obj);
    assert(obj.one.call(42) == obj);
    assert(obj.two.call(42) == 42);
  });
});

});