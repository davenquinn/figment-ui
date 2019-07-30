// Bundles electron code for production
const Bundler = require('parcel-bundler');

// Entrypoint file location
const file = "src/index.html";

// Bundler options
const options = {
  hmr: false,
  publicUrl: './',
  outDir: 'lib', // The out directory to put the build files in, defaults to dist
  watch: true, // whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
  cache: false, // Enabled or disables caching, defaults to true
  contentHash: false, // Disable content hash from being included on the filename
  minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
  target: 'electron', // browser/node/electron, defaults to browser
  sourceMaps: true, // Enable or disable sourcemaps, defaults to enabled (not supported in minified builds yet)
  bundleNodeModules: false
};

const bundler = new Bundler(file, options);

bundler.bundle().catch(err => console.error(err))