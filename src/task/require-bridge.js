// https://github.com/nodejs/node/blob/254058109f469f64b8ca23bb65a206abab380604/lib/internal/modules/cjs/loader.js#L646
const vm = require('vm');
const path = require('path');
const Module = require('module');
const fs = require('fs');

function makeRequireFunction() {

  function require(path) {
    try {
      exports.requireDepth += 1;
      return Module.prototype.require(path);
    } finally {
      exports.requireDepth -= 1;
    }
  }

  function resolve(request, options) {
    if (typeof request !== 'string') {
      throw new ERR_INVALID_ARG_TYPE('request', 'string', request);
    }
    return Module._resolveFilename(request, mod, false, options);
  }

  require.resolve = resolve;

  function paths(request) {
    if (typeof request !== 'string') {
      throw new ERR_INVALID_ARG_TYPE('request', 'string', request);
    }
    return Module._resolveLookupPaths(request, mod, true);
  }

  resolve.paths = paths;

  require.main = process.mainModule;

  // Enable support to add extra extension types.
  require.extensions = Module._extensions;

  require.cache = Module._cache;

  return require;
}

module.exports = function(filename) {

  // create wrapper function
  var content = fs.readFileSync(filename, 'utf8');



  var wrapper = Module.wrap(content);

  var compiledWrapper = vm.runInNewContext(wrapper, {}, {});

  var dirname = path.dirname(filename);
  var require = makeRequireFunction();
  var result;

  var exports = {};
  var mod = {exports};

  compiledWrapper(exports, require, mod,
                                filename, dirname, process, global, Buffer);

  return mod.exports;
};
