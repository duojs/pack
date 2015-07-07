exports.A = {
  id: "A",
  type: "js",
  src: "require('./B');",
  entry: true,
  deps: {
    "./B": "B"
  }
};
exports.B = {
  id: "B",
  type: "js",
  src: "module.exports = require('./A')",
  deps: {
    "./A": "A"
  }
};
