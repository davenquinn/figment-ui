// https://github.com/nodejs/node/blob/254058109f469f64b8ca23bb65a206abab380604/lib/internal/modules/cjs/loader.js#L646
const vm = require('vm');
const path = require('path');
const Module = require('module');
const fs = require('fs');
const isWindows = false;

function _resolveLookupPaths(request) {

  let dirnamePaths = [];

  let dirname = path.dirname(request);
  while (dirname != "/") {
    dirnamePaths.push(path.join(dirname, "node_modules"));
    dirname = path.resolve(path.join(dirname, ".."));
  }

  const mainPaths = ['.'].concat(Module._nodeModulePaths('.'), dirnamePaths);
  return mainPaths;

  // Add electron path
  // "/usr/local/var/nodenv/versions/9.11.2/lib/node_modules/electron/dist/Electron.app/Contents/Resources/electron.asar/renderer/api/exports"

};

function makeRequireFunction(mod) {

  function require(path) {
    try {
      exports.requireDepth += 1;
      return mod.require(path);
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
    return _resolveLookupPaths(request);
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
  var dirname = path.dirname(filename);

  var wrapper = Module.wrap(content);

  var mod = new Module(filename);

  var require = makeRequireFunction(mod);

  var compiledWrapper = vm.runInThisContext(wrapper, filename);

  console.log(require.resolve.paths('.'));

  mod.exports = {};

  compiledWrapper(exports, require, mod, filename, dirname, process, global, Buffer);

  return mod.exports;
};
