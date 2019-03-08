/*
 * This file houses configuration for the Parcel bundler
 * that packages frontend scripts for the tool itself.
 */

const Bundler = require('parcel-bundler');
const path = require('path');

const project = (fp)=>{
  // Path relative to the project
  return path.join(__dirname, '..', fp);
};

// Entrypoint file location
const file = project('_window/index.html')

// Bundler options
const options = {
  outDir: project('lib'), // The out directory to put the build files in, defaults to dist
  publicUrl: './', // The url to server on, defaults to dist
  watch: true, // whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
  cache: true, // Enabled or disables caching, defaults to true
  cacheDir: project('.cache'), // The directory cache gets put in, defaults to .cache
  contentHash: false, // Disable content hash from being included on the filename
  minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
  scopeHoist: false, // turn on experimental scope hoisting/tree shaking flag, for smaller production bundles
  target: 'electron', // browser/node/electron, defaults to browser
  https: false, // Serve files over https or http, defaults to false
  logLevel: 3, // 3 = log everything, 2 = log warnings & errors, 1 = log errors
  hmrPort: 0, // The port the HMR socket runs on, defaults to a random free port (0 in node.js resolves to a random free port)
  sourceMaps: true, // Enable or disable sourcemaps, defaults to enabled (not supported in minified builds yet)
  hmrHostname: '', // A hostname for hot module reload, default to ''
  detailedReport: false // Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
};

async function runBundle(opts) {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = new Bundler(file, options);
  const bundle = await bundler.bundle();
}

runBundle();

