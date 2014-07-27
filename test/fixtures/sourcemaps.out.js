(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @param {Boolean} jumped
   * @api public
   */

  function require(name, jumped){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];

    fn.call(m.exports, function(req){
      var dep = modules[id][1][req];
      return require(dep ? dep : req);
    }, m, m.exports, outer, modules, cache, entries);

    // expose as `name`.
    if (name) cache[name] = cache[id];

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
module.exports = "m"
}, {}]}, {}, {"1":""})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zdGVwaGVubWF0aGllc29uL3JlcG9zL2R1by9kdW8tcGFjay9saWIvanMvcmVxdWlyZS5qcyIsIm0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkZBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gb3V0ZXIobW9kdWxlcywgY2FjaGUsIGVudHJpZXMpe1xuXG4gIC8qKlxuICAgKiBHbG9iYWxcbiAgICovXG5cbiAgdmFyIGdsb2JhbCA9IChmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfSkoKTtcblxuICAvKipcbiAgICogUmVxdWlyZSBgbmFtZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0ganVtcGVkXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlcXVpcmUobmFtZSwganVtcGVkKXtcbiAgICBpZiAoY2FjaGVbbmFtZV0pIHJldHVybiBjYWNoZVtuYW1lXS5leHBvcnRzO1xuICAgIGlmIChtb2R1bGVzW25hbWVdKSByZXR1cm4gY2FsbChuYW1lLCByZXF1aXJlKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm5vdCBmaW5kIG1vZHVsZSBcIicgKyBuYW1lICsgJ1wiJyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBtb2R1bGUgYGlkYCBhbmQgY2FjaGUgaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXF1aXJlXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gY2FsbChpZCwgcmVxdWlyZSl7XG4gICAgdmFyIG0gPSBjYWNoZVtpZF0gPSB7IGV4cG9ydHM6IHt9IH07XG4gICAgdmFyIG1vZCA9IG1vZHVsZXNbaWRdO1xuICAgIHZhciBuYW1lID0gbW9kWzJdO1xuICAgIHZhciBmbiA9IG1vZFswXTtcblxuICAgIGZuLmNhbGwobS5leHBvcnRzLCBmdW5jdGlvbihyZXEpe1xuICAgICAgdmFyIGRlcCA9IG1vZHVsZXNbaWRdWzFdW3JlcV07XG4gICAgICByZXR1cm4gcmVxdWlyZShkZXAgPyBkZXAgOiByZXEpO1xuICAgIH0sIG0sIG0uZXhwb3J0cywgb3V0ZXIsIG1vZHVsZXMsIGNhY2hlLCBlbnRyaWVzKTtcblxuICAgIC8vIGV4cG9zZSBhcyBgbmFtZWAuXG4gICAgaWYgKG5hbWUpIGNhY2hlW25hbWVdID0gY2FjaGVbaWRdO1xuXG4gICAgcmV0dXJuIGNhY2hlW2lkXS5leHBvcnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVpcmUgYWxsIGVudHJpZXMgZXhwb3NpbmcgdGhlbSBvbiBnbG9iYWwgaWYgbmVlZGVkLlxuICAgKi9cblxuICBmb3IgKHZhciBpZCBpbiBlbnRyaWVzKSB7XG4gICAgaWYgKGVudHJpZXNbaWRdKSB7XG4gICAgICBnbG9iYWxbZW50cmllc1tpZF1dID0gcmVxdWlyZShpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcXVpcmUoaWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEdW8gZmxhZy5cbiAgICovXG5cbiAgcmVxdWlyZS5kdW8gPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY2FjaGUuXG4gICAqL1xuXG4gIHJlcXVpcmUuY2FjaGUgPSBjYWNoZTtcblxuICAvKipcbiAgICogRXhwb3NlIG1vZHVsZXNcbiAgICovXG5cbiAgcmVxdWlyZS5tb2R1bGVzID0gbW9kdWxlcztcblxuICAvKipcbiAgICogUmV0dXJuIG5ld2VzdCByZXF1aXJlLlxuICAgKi9cblxuICAgcmV0dXJuIHJlcXVpcmU7XG59KSIsIm1vZHVsZS5leHBvcnRzID0gXCJtXCIiXX0=