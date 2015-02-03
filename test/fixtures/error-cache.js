exports.a = {
  id: 'a',
  type: 'js',
  src: 'var b1, b2; try { b1 = require("./b"); } catch (err) { b1 = err; }\ntry { b2 = require("./b"); } catch (err) { b2 = err; }\nexports.b1 = b1; exports.b2 = b2;',
  entry: true,
  deps: { './b': 'b' }
};

exports.b = {
  id: 'b',
  type: 'js',
  src: 'throw "fail";'
};
