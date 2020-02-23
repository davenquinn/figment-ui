/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {Component} from 'react';
import h from '~/hyper';
import {TaskElement, TaskStylesheet} from './elements';
import {TaskShape} from './types';
import PacmanLoader from 'react-spinners/PacmanLoader';
import {BundlerError} from './error';
import {FigureContainer} from '../figure-container';
import T from 'prop-types';
import {MarginType} from '~/types';
import {AppToaster} from '~/toaster';
import Bundler from 'parcel-bundler';
import path from 'path';
import decache from 'decache';
import fs from 'fs';
import requireStack from 'require-stack';
import webpack from 'webpack';

const createBundler = function(file, opts){
  // // Create the Parcel bundler
  const options = {
    hmr: false,
    outDir: 'dist', // The out directory to put the build files in, defaults to dist
    publicUrl: './', // The url to server on, defaults to dist
    watch: true, // whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
    cache: true, // Enabled or disables caching, defaults to true
    cacheDir: '.cache', // The directory cache gets put in, defaults to .cache
    contentHash: false, // Disable content hash from being included on the filename
    minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
    scopeHoist: false, // turn on experimental scope hoisting/tree shaking flag, for smaller production bundles
    target: 'electron', // browser/node/electron, defaults to browser
    https: false, // Serve files over https or http, defaults to false
    logLevel: 3, // 3 = log everything, 2 = log warnings & errors, 1 = log errors
    //hmrPort: 0, # The port the HMR socket runs on, defaults to a random free port (0 in node.js resolves to a random free port)
    sourceMaps: true, // Enable or disable sourcemaps, defaults to enabled (not supported in minified builds yet)
    //hmrHostname: '', # A hostname for hot module reload, default to ''
    detailedReport: true, // Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
    bundleNodeModules: false,
    ...opts
  };

  const bundler = new Bundler(file, options);
  return bundler;
};


const sleep = (timeout=1000) => new Promise(function(resolve, reject){
  const fn = () => resolve();
  return setTimeout(fn, timeout);
});

const Spinner = () => h(PacmanLoader, {size: 20, sizeUnit: 'px', color: '#aaa'});

global.requireInDir = function(file, extraPaths=[]){
  const oldPaths = [...global.require.main.paths];
  // Add new paths to require
  const dirnamePaths = [];
  const baseDir = path.dirname(path.resolve(file));
  let __dir = baseDir;
  while (__dir !== "/") {
    dirnamePaths.push(path.join(__dir, "node_modules"));
    __dir = path.resolve(path.join(__dir, ".."));
  }
  // Monkey-patch the global require
  global.require.main.paths = [baseDir, ...dirnamePaths];
  const code = require(file);
  global.require.main.paths = oldPaths;
  return code;
};

class ParcelTaskRenderer extends Component {
  static initClass() {
    this.propTypes = {
      task: TaskShape,
      marginTop: MarginType,
      zoomLevel: T.number
    };
  }
  constructor(props){
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.recordSize = this.recordSize.bind(this);
    this.startBundler = this.startBundler.bind(this);
    this.onBundlingStarted = this.onBundlingStarted.bind(this);
    this.handleBundleError = this.handleBundleError.bind(this);
    this.onBundlingFinished = this.onBundlingFinished.bind(this);
    super(props);
    this.bundler = null;
    this.state = {
      code: null,
      styles: null,
      error: null,
      size: null
    };
  }
  render() {
    const {task, zoomLevel, marginTop} = this.props;
    const {opts} = task;
    let {multiPage} = opts;
    if (multiPage == null) { multiPage = false; }

    const {code, styles, error, size} = this.state;
    let width = null;
    if (size != null) {
      ({
        width
      } = size);
    }

    if ((task == null)) {
      return null;
    }
    if (error != null) {
      return h(BundlerError, {error});
    }
    if ((code == null) && (styles == null)) {
      return h('div.progress', {style: {marginTop}}, [
        h(Spinner),
        h('p', "Digesting your code")
      ]);
    }
    return h(FigureContainer, {marginTop, zoomLevel, multiPage, width},  [
      h(TaskStylesheet, {styles}),
      h(TaskElement, {code, recordSize: this.recordSize, opts})
    ]);
  }

  recordSize({width, height}){
    return this.setState({size: {width, height}});
  }

  startBundler() {
    /*
     * This is the function that actually runs a discrete task
     */
    const {task} = this.props;
    console.log("Running task");

    const {code: codeFile} = task; // The file that has the code in it...
    const dn = path.dirname(path.resolve(codeFile));
    console.log(dn);

    const cacheDir = path.join(dn, '.cache');
    const outDir = path.join(cacheDir,'build');

    try {
      process.chdir(dn);
    } catch (err) {
      this.setState({error: err});
      return;
    }

    this.bundler = createBundler(codeFile, {outDir, cacheDir});
    console.log(`Running bundler process with PID ${this.bundler.pid}`);
    this.bundler.bundle()
      .catch(e=> console.error(e));

    this.bundler.on('buildStart', bundle=> {
      return this.onBundlingStarted(bundle);
    });

    this.bundler.on('buildError', error=> {
      return this.handleBundleError(error);
    });

    return this.bundler.on('bundled', bundle=> {
      return this.onBundlingFinished(bundle, outDir);
    });
  }

  onBundlingStarted(bundle){
    console.log("Bundling started");
    return this.setState({code: null, styles: null, error: null});
  }

  handleBundleError(err){
    console.error(err);
    return this.setState({error: err});
  }

  onBundlingFinished(bundle, outDir){
    if (this.state.error != null) {
      return;
    }
    console.clear();
    console.log("Bundling done");
    const msg = `Built in ${bundle.bundleTime}ms`;
    AppToaster.show({message: msg, intent: "success", icon: 'clean', timeout: 4000});

    if (bundle.type !== 'js') {
      throw "Only javascript output is supported (for now)";
    }

    let styles = null;
    const cssFile = bundle.siblingBundlesMap.get("css");
    // Get css and javascript
    if ((cssFile != null) && fs.existsSync(cssFile.name)) {
      styles = fs.readFileSync(cssFile.name, 'utf-8');
    }

    console.log(`Requiring compiled code from '${bundle.name}'`);

    // Reset require paths for imported module
    // https://tech.wayfair.com/2018/06/custom-module-loading-in-a-node-js-environment/
    const fn = path.basename(bundle.name);
    const dn = path.dirname(bundle.name);

    decache(bundle.name);
    const oldPaths = [...global.require.main.paths];
    // Add new paths to require
    const dirnamePaths = [];
    let _dir = dn;
    while (_dir !== "/") {
      dirnamePaths.push(path.join(_dir, "node_modules"));
      _dir = path.resolve(path.join(_dir, ".."));
    }
    // Monkey-patch the global require
    global.require.main.paths = [dn, ...dirnamePaths, ...oldPaths];
    const code = require(bundle.name);
    global.require.main.paths = oldPaths;
    return this.setState({code, styles, error: null});
  }

  componentDidMount() {
    const {task} = this.props;
    if (task == null) { return; }
    return this.startBundler(task);
  }

  componentDidUpdate(prevProps){
    const {task} = this.props;
    if (prevProps.task === task) { return; }
  }
    //@startBundler task

  componentWillUnmount() {
    if (this.bundler == null) { return; }
    return this.bundler.stop();
  }
}
ParcelTaskRenderer.initClass();

class WebpackTaskRenderer extends Component {
  constructor(props){
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.recordSize = this.recordSize.bind(this);
    this.handleBundleError = this.handleBundleError.bind(this);
    this.startBundler = this.startBundler.bind(this);
    this.onBundlingFinished = this.onBundlingFinished.bind(this);
    super(props);
    this.bundler = null;
    this.state = {
      code: null,
      styles: null,
      errors: null,
      size: null
    };
  }

  recordSize({width, height}){
    return this.setState({size: {width, height}});
  }

  render() {
    const {task, zoomLevel, marginTop} = this.props;
    const {opts} = task;
    let {multiPage} = opts;
    if (multiPage == null) { multiPage = false; }

    const {code, styles, errors, size} = this.state;
    let width = null;
    if (size != null) {
      ({
        width
      } = size);
    }

    if ((task == null)) {
      return null;
    }
    if (errors != null) {
      return h("div.errors", [errors[0]].map(error => h(BundlerError, {error})));
    }
    if ((code == null) && (styles == null)) {
      return h('div.progress', {style: {marginTop}}, [
        h(Spinner),
        h('p', [
          "Digesting your code with ",
          h("b", "Webpack")
        ])
      ]);
    }
    return h(FigureContainer, {marginTop, zoomLevel, multiPage, width},  [
      h(TaskElement, {code, recordSize: this.recordSize, opts})
    ]);
  }

  handleBundleError(err){
    console.error(err);
    return this.setState({error: err});
  }

  startBundler() {
    let cfg;
    const {webpackConfig, task} = this.props;
    if (path.isAbsolute(webpackConfig)) {
      cfg = require(webpackConfig);
    } else {
      cfg = requireInDir(webpackConfig);
    }

    cfg.entry = task.code;
    const codeDir = path.dirname(task.code);
    cfg.output = {
      filename: '[name].js',
      libraryTarget: 'commonjs2',
      path: path.join(codeDir, '.cache', 'webpack')
    };
    cfg.target = 'electron-renderer';

    console.clear();
    console.log(cfg);
    this.webpack = webpack(cfg);
    const onBundle = (err, res)=> {
      if (err != null) {
        return this.handleBundleError(err);
      }
      return this.onBundlingFinished(res);
    };

    this.watcher = this.webpack.watch({}, onBundle);
    return console.log("Starting webpack watcher");
  }

  onBundlingFinished(res){
    if (this.state.errors != null) {
      return;
    }
    if (res.compilation.errors.length > 0) {
      this.setState({errors: res.compilation.errors});
      return;
    }

    console.log(res);
    console.log("Bundling done");

    const bundleTime = res.endTime-res.startTime;
    const msg = `Built in ${bundleTime}ms`;
    AppToaster.show({message: msg, intent: "success", icon: 'clean', timeout: 4000});

    const bundleName = res.compilation.assets['main.js'].existsAt;

    console.log(`Requiring compiled code from '${bundleName}'`);

    // Reset require paths for imported module
    // https://tech.wayfair.com/2018/06/custom-module-loading-in-a-node-js-environment/
    const fn = path.basename(bundleName);
    const dn = path.dirname(bundleName);

    decache(bundleName);
    const oldPaths = [...global.require.main.paths];
    // Add new paths to require
    const dirnamePaths = [];
    let _dir = dn;
    while (_dir !== "/") {
      dirnamePaths.push(path.join(_dir, "node_modules"));
      _dir = path.resolve(path.join(_dir, ".."));
    }
    // Monkey-patch the global require
    global.require.main.paths = [dn, ...dirnamePaths, ...oldPaths];
    const code = require(bundleName);
    global.require.main.paths = oldPaths;
    return this.setState({code, errors: null});
  }

  componentDidMount() {
    const {task} = this.props;
    if (task == null) { return; }
    return this.startBundler(task);
  }

  componentWillUnmount() {
    if (this.watcher == null) { return; }
    return this.watcher.close();
  }
}

class TaskRenderer extends Component {
  render() {
    const entryFile = this.props.task.code;
    const entryDir = path.dirname(entryFile);
    let {webpackConfig} = this.props.task.opts;
    if (webpackConfig != null) {
      webpackConfig = path.resolve(path.join(entryDir, webpackConfig));
      //if fs.existsSync(webpackConfig)
      console.log("Bundling with webpack");
      return h(WebpackTaskRenderer, {webpackConfig, ...this.props});
    }
    return h(ParcelTaskRenderer, this.props);
  }
}

export {TaskRenderer, TaskShape};
