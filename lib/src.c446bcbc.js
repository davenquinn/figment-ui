process.env.HMR_PORT=0;process.env.HMR_HOSTNAME="localhost";// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"../bundler/index.js":[function(require,module,exports) {
const { spawn } = require('child_process');
const { ipcRenderer, remote } = require('electron');
const path = require('path');
const isRenderer = require('is-electron-renderer');

const debug = false;

function printLine(obj) {
  let line;
  // Convert to string if needed
  if (typeof obj === 'string' || obj instanceof String) {
    line = obj;
  } else {
    line = JSON.stringify(obj);
  }
  if (isRenderer) {
    ipcRenderer.send('bundle-log', line);
  } else {
    let newLine = line.replace("✨", "🌸");
    process.stdout.write(newLine);
  }
}

async function printToStdout(child) {
  child.stdout.then( data => {
    let line = data.toString('utf8');
    printLine(line);
  });
};

const runBundler = function(inFile, options={}) {
  let env, runner, bundlerScript;
  if (isRenderer) {
    env = Object.create(remote.process.env);
    runner = remote.process.argv[0];
    bundlerScript = remote.getGlobal('bundlerScript')
  } else {
    env = Object.create(process.env);
    runner = process.argv[0];
    bundlerScript = global.bundlerScript;
  }
  env.ELECTRON_RUN_AS_NODE = '1';
  env.FORCE_COLOR = true;

  const opts = JSON.stringify(options);
  const proc = spawn(runner, [bundlerScript, inFile, opts], {
    env: env,
    stdio: ['pipe','pipe','inherit','ipc']
  });
  proc.on('message', (bundle)=>{
    if (!isRenderer) return;
    if (debug) printLine(bundle);
  });
  printToStdout(proc);

  return proc;
};

module.exports = {runBundler};

},{}],"task.coffee":[function(require,module,exports) {
(function() {
  var fs, ipcRenderer, path, prepareForPrinting, redirectErrors, runBundler, runTask;

  path = require('path');

  fs = require('fs');

  ({runBundler} = require('../bundler'));

  ({ipcRenderer} = require('electron'));

  runTask = function(e, data, callback) {
    var cacheDir, code, dn, outDir, proc;
    /*
     * This is the function that actually runs a discrete task
     */
    if (callback == null) {
      callback = null;
    }
    ({code} = data); // The file that has the code in it...
    dn = path.dirname(path.resolve(code));
    cacheDir = path.join(dn, '.cache');
    outDir = path.join(cacheDir, 'build');
    proc = runBundler(code, {outDir, cacheDir});
    return proc.on('message', function(bundle) {
      var compiledCode, css, el, func, head, newEl, style, styles;
      el = document.querySelector("#pdf-printer-figure-container");
      newEl = document.createElement('div');
      newEl.id = 'pdf-printer-figure-container';
      el.parentNode.replaceChild(newEl, el);
      console.log("Trying to run task");
      console.log("Ready");
      console.log(bundle);
      if (bundle.type !== 'js') {
        throw "Only javascript output is supported (for now)";
      }
      compiledCode = bundle.name;
      css = path.join(outDir, 'index.css');
      if (fs.existsSync(css)) {
        styles = fs.readFileSync(css, 'utf-8');
        head = document.querySelector('head');
        style = document.createElement('style');
        head.appendChild(style);
        style.type = 'text/css';
        style.appendChild(document.createTextNode(styles));
      }
      // Race condition
      process.chdir(dn);
      func = require(compiledCode);
      // Try to make requires relative to initial dir
      return func(newEl, callback);
    });
  };

  prepareForPrinting = function() {
    var el, height, msg, width;
    el = document.querySelector('#pdf-printer-figure-container>*:first-child');
    ({width, height} = el.getBoundingClientRect());
    msg = {
      message: "Ready to print",
      bounds: {
        width,
        height: height + 2
      }
    };
    return ipcRenderer.sendToHost(JSON.stringify(msg));
  };

  redirectErrors = function() {
    var c;
    c = remote.getGlobal('console');
    console.log = c.log;
    console.error = c.error;
    console.warn = c.warn;
    // redirect errors to stderr
    return window.addEventListener('error', function(e) {
      e.preventDefault();
      return console.error(e.error.stack || 'Uncaught ' + e.error);
    });
  };

  module.exports = {runTask, prepareForPrinting, redirectErrors};

}).call(this);

},{"../bundler":"../bundler/index.js"}],"lib.coffee":[function(require,module,exports) {
(function() {
  var Printer, Promise, colors, createHash, d3, fs, generateFigure, ipcRenderer, options, path, pixelsToMicrons, printFigureArea, printToImage, printToPDF, remote, sleep, waitForUserInput;

  Promise = require('bluebird');

  fs = require('fs');

  ({remote, ipcRenderer} = require('electron'));

  ({createHash} = require('crypto'));

  path = require('path');

  d3 = require('d3-selection');

  colors = require('colors/safe');

  options = remote.getGlobal('options' || {});

  if (options.dpi == null) {
    options.dpi = 96;
  }

  options.log = false;

  waitForUserInput = function(data) {
    return new Promise(function(resolve, reject) {
      ipcRenderer.once('done-waiting', function() {
        return resolve(data);
      });
      return ipcRenderer.send('wait-for-input');
    });
  };

  sleep = function(data) {
    return new Promise(function(resolve, reject) {
      var fn;
      fn = function() {
        return resolve(data);
      };
      return setTimeout(fn, 1000);
    });
  };

  generateFigure = function(task) {
    var main, webview;
    main = d3.select("#pdf-printer-ui-controls");
    main.html("");
    //# Set up a webview
    webview = main.append("webview").attr("nodeintegration", true).attr("src", "file://" + require.resolve("../_runner/index.html")).node();
    return new Promise(function(resolve, reject) {
      webview.addEventListener('dom-ready', function(e) {
        return webview.send("run-task", {
          code: task.code,
          helpers: task.helpers
        });
      });
      return webview.addEventListener('ipc-message', function(e) {
        if (event.channel === 'finished') {
          return resolve(task);
        }
      });
    });
  };

  pixelsToMicrons = function(px) {
    return Math.ceil(px / 96.0 * 25400);
  };

  printToPDF = function(webview, size) {
    return new Promise(function(resolve, reject) {
      /*
      Print the webview to the callback
      */
      var el, opts;
      el = document.querySelector("#pdf-printer-figure-container");
      opts = {
        printBackground: true,
        marginsType: 1,
        pageSize: {
          height: pixelsToMicrons(size.height * size.scaleFactor) + 10,
          width: pixelsToMicrons(size.width * size.scaleFactor) + 10
        }
      };
      el.style.transform = `scale(${size.scaleFactor})`;
      el.style.transformOrigin = "top left";
      return webview.printToPDF(opts, (e, data) => {
        if (e != null) {
          reject(e);
        }
        resolve(data);
        el.style.transform = null;
        return el.style.transformOrigin = null;
      });
    });
  };

  printToImage = function(webview, opts) {
    return new Promise(function(resolve, reject) {
      var height, rect, width;
      /*
      Print the webview to the callback
      */
      if (opts.format == null) {
        opts.format = 'png';
      }
      if (opts.scaleFactor == null) {
        opts.scaleFactor = 1.8;
      }
      if (opts.quality == null) {
        opts.quality = 90;
      }
      ({width, height} = opts);
      width *= opts.scaleFactor;
      height *= opts.scaleFactor;
      rect = {
        x: 0,
        y: 30,
        width,
        height
      };
      console.log(rect);
      return webview.capturePage(rect, function(image) {
        var d;
        if (typeof e !== "undefined" && e !== null) {
          reject(e);
        }
        if (['jpeg', 'jpg'].includes(opts.format)) {
          d = image.toJPEG(rect, opts.quality);
        } else {
          d = image.toPNG(opts.scaleFactor);
        }
        return resolve(d);
      });
    });
  };

  printFigureArea = async function(task) {
    var buf, dir, el, ext, height, opts, outfile, scaleFactor, wc, width;
    /*
     * Function to print webpage
     */
    console.log(task);
    opts = task.opts || {};
    ({scaleFactor} = opts);
    if (scaleFactor == null) {
      scaleFactor = 1;
    }
    el = document.querySelector('#pdf-printer-figure-container>*:first-child');
    ({width, height} = el.getBoundingClientRect());
    opts = {width, height, scaleFactor};
    ({outfile} = task);
    dir = path.dirname(outfile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    console.log(`Printing to ${outfile}`);
    ext = path.extname(outfile);
    wc = remote.getCurrentWebContents();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      opts.format = ext.slice(1);
      buf = (await printToImage(wc, opts));
    } else {
      buf = (await printToPDF(wc, opts));
    }
    console.log(`${outfile}`);
    fs.writeFileSync(outfile, buf);
    return console.log("Finished task");
  };

  // Initialize renderer
  Printer = class Printer {
    constructor(options = {}) {
      var base;
      /*
      Setup a rendering object
      */
      console.log(arguments[0]);
      this.cliOptions = {};
      console.log("Started renderer");
      this.options = options;
      if ((base = this.options).buildDir == null) {
        base.buildDir = '';
      }
      this.tasks = [];
    }

    task(fn, funcOrString, opts = {}) {
      var func, h;
      /*
      Add a task
      */
      if (opts.dpi == null) {
        opts.dpi = 300;
      }
      // Check if we've got a function or string
      if (typeof funcOrString === 'function') {
        throw "We only support strings now, because we run things in a webview";
        func = funcOrString;
      } else {
        // Require relative to parent module,
        // but do it later so errors can be accurately
        // traced
        if (!path.isAbsolute(funcOrString)) {
          func = path.join(process.cwd(), funcOrString);
        } else {
          func = funcOrString;
        }
      }
      //f = require fn
      //f(el, cb)
      console.log(this.options);
      // Apply build directory
      if (fn != null) {
        if (!path.isAbsolute(fn)) {
          fn = path.join(this.options.buildDir, fn);
        }
      } else {
        fn = "";
      }
      h = createHash('md5').update(fn).digest('hex');
      this.tasks.push({
        outfile: fn,
        code: func,
        helpers: this.options.helpers,
        hash: h,
        opts: opts
      });
      return this;
    }

    run() {
      var __runTask;
      // Progress through list of figures, print
      // each one to file
      __runTask = function(t) {
        var p;
        console.log(`${t.code} ⇒ ${t.outfile}`);
        p = generateFigure(t);
        if (options.waitForUser) {
          p = p.then(waitForUserInput);
        }
        return p.then(printFigureArea).catch(function(e) {
          return console.log('Error: ' + e);
        });
      };
      return Promise.map(this.tasks, __runTask, {
        concurrency: 1
      });
    }

  };

  module.exports = {Printer, printFigureArea, generateFigure};

}).call(this);

},{}],"index.coffee":[function(require,module,exports) {
(function() {
  var Printer, Promise, body, controls, createMainPage, currentTask, d3, fn, getSpecs, ipcRenderer, isMainPage, itemSelected, loadEntryPoint, main, openEditor, options, p, path, printFigureArea, reloadWebview, remote, renderSpecList, runBasedOnHash, runTask, runTaskA, setZoomFactor, sharedStart, spawn, taskRunner, tasks, title, webFrame, zoomContainer;

  ({remote, ipcRenderer, webFrame} = require('electron'));

  path = require('path');

  Promise = require('bluebird');

  d3 = require('d3-selection');

  ({spawn} = require('child_process'));

  ({runTask} = require('./task'));

  ({Printer, printFigureArea} = require("./lib.coffee"));

  window.Printer = Printer;

  options = remote.getGlobal('options');

  // # Print logging statements to both webtools and to command line
  // c1 = remote.getGlobal('console')
  // for i in ['log', 'warn', 'error']
  //   oldFunc = console[i]
  //   console[i] = ->
  //     oldFunc.apply(arguments)
  //     c1[i].apply(arguments)
  process.exit = remote.app.quit;

  // redirect errors to stderr
  window.addEventListener('error', function(e) {
    e.preventDefault();
    return console.error(e.error.stack || 'Uncaught ' + e.error);
  });

  createMainPage = null;

  isMainPage = null;

  tasks = [];

  body = d3.select('body');

  zoomContainer = d3.select('#pdf-printer-figure-zoom-container');

  main = d3.select('#pdf-printer-figure-container');

  currentTask = null;

  reloadWebview = function() {
    var wc;
    wc = remote.getCurrentWebContents();
    wc.reloadIgnoringCache();
    webFrame.setZoomLevel(1);
    return console.log("Reloading...");
  };

  controls = d3.select("#pdf-printer-ui-controls");

  title = d3.select('#pdf-printer-ui-controls>h1');

  d3.select('#toggle-dev-tools').on('click', function() {
    var win;
    ipcRenderer.send('dev-tools');
    win = require('electron').remote.getCurrentWindow();
    return win.openDevTools();
  });

  ipcRenderer.on('show-toolbar', function(event, toolbarEnabled) {
    var mode;
    mode = toolbarEnabled ? 'flex' : 'none';
    return controls.style('display', mode);
  });

  setZoomFactor = function(zoom) {
    var z;
    webFrame.setZoomLevel(1);
    z = zoom === 1 ? null : `scale(${zoom})`;
    return main.style('transform', z).style('transform-origin', "0px 0px").style('padding', `${20 / zoom}px`);
  };

  ipcRenderer.on('zoom', function(event, zoom) {
    return setZoomFactor(zoom);
  });

  ipcRenderer.on('reload', reloadWebview);

  sharedStart = function(array) {
    var A, L, a1, a2, i;
    // From
    // http://stackoverflow.com/questions/1916218/
    //       find-the-longest-common-starting-substring-in-a-set-of-strings
    A = array.concat().sort();
    a1 = A[0];
    a2 = A[A.length - 1];
    L = a1.length;
    i = 0;
    while (i < L && a1.charAt(i) === a2.charAt(i)) {
      i++;
    }
    return a1.substring(0, i);
  };

  openEditor = function(d) {
    return spawn(process.EDITOR, [d.code], {
      detached: true
    });
  };

  itemSelected = function(d) {
    var devToolsEnabled, reload, t, vals, win;
    /* Run a single task */
    console.log("Running task");
    location.hash = `#${d.hash}`;
    t = title.html("");
    if (tasks.length > 1) {
      t.append('a').attr('href', '#').text('◀︎ Back to list').on('click', loadEntryPoint(createMainPage));
    } else {
      t.text("PDF Printer");
    }
    /* set current task */
    d3.select('#print').on('click', function() {
      console.log("Printing figure");
      return printFigureArea(d);
    });
    d3.select('#open-editor').on('click', function() {
      if (typeof webview === "undefined" || webview === null) {
        return;
      }
      console.log("Opening editor");
      return openEditor(d);
    });
    d3.selectAll("style").remove();
    main.html("");
    ({devToolsEnabled, reload} = remote.getGlobal('options'));
    win = require('electron').remote.getCurrentWindow();
    if (devToolsEnabled) {
      win.openDevTools();
    }
    vals = (function() {
      var code, helpers;
      return ({code, helpers} = d);
    })();
    console.log("Ready to run task");
    return runTask(null, vals, function() {
      return console.log("Finished rendering");
    });
  };

  renderSpecList = function(d) {
    var arr, el, prefix, sel;
    console.log("Spec list");
    // Render spec list from runner
    el = d3.select(this).attr("class", "task-list");
    // Find shared starting substring
    arr = d.tasks.map(function(d) {
      return d.outfile;
    });
    arr.push(d.name);
    prefix = sharedStart(arr);
    el.append('h5').text(prefix);
    el.append('h2').text(d.name.slice(prefix.length));
    sel = el.append('ul').selectAll('li').data(d.tasks);
    return sel.enter().append('li').append('a').attr('href', function(d) {
      return `#${d.hash}`;
    }).text(function(d) {
      return d.outfile.slice(prefix.length);
    }).on('click', itemSelected);
  };

  createMainPage = function(runners) {
    var sel;
    controls.style("display", "none");
    // Create a list of tasks
    main = d3.select("#pdf-printer-figure-container");
    main.html("");
    sel = main.selectAll('div').data(runners);
    return sel.enter().append('div').attr('class', 'runner').each(renderSpecList);
  };

  runBasedOnHash = function(runners) {
    var _, item, j, len, z;
    z = remote.getGlobal('zoom');
    setZoomFactor(z);
    _ = runners.map(function(d) {
      return d.tasks;
    });
    tasks = Array.prototype.concat.apply([], _);
    // We've only got one possibility,
    // so we don't need hashes!
    // We could probably represent this much more cleanly
    if (tasks.length === 1) {
      console.log("Rendering single task");
      itemSelected(tasks[0]);
      return;
    }
    if (location.hash.length > 1) {
      console.log(`Attempting to navigate to ${location.hash}`);
// Check if we can grab a dataset
      for (j = 0, len = tasks.length; j < len; j++) {
        item = tasks[j];
        if (item.hash === location.hash.slice(1)) {
          itemSelected(item);
          return;
        }
      }
    }
    // If no hash then create main page
    return createMainPage(runners);
  };

  getSpecs = function(d) {
    var res;
    console.log(d);
    res = require(d);
    return Promise.resolve(res).then(function(v) {
      v.name = d;
      return v;
    });
  };

  loadEntryPoint = function(fn) {
    return function() {
      var p, spec;
      console.log(`Loading entry point ${fn}`);
      // If we are in spec mode
      if (options.specs != null) {
        p = Promise.map(options.specs, getSpecs);
      } else {
        spec = new Printer;
        spec.task(options.outfile, options.infile);
        p = Promise.resolve([spec]);
      }
      return p.then(fn);
    };
  };

  runTaskA = function(spec) {
    var taskRunner;
    //# Runner for all tasks
    console.log(`Running tasks from ${spec}`);
    taskRunner = require(spec);
    return Promise.resolve(taskRunner).then(function(t) {
      return t.run();
    });
  };

  if (options.debug) {
    fn = loadEntryPoint(runBasedOnHash);
    fn();
  } else {
    // Run single tasks
    if (options.specs != null) {
      console.log("Running from spec");
      p = Promise.map(options.specs, runTask, {
        concurrency: 1
      });
    } else {
      taskRunner = new Printer;
      taskRunner.task(options.outfile, options.infile);
      p = taskRunner.run();
    }
    p.then(function() {
      console.log("Done!");
      return remote.app.quit();
    });
  }

}).call(this);

},{"./task":"task.coffee","./lib.coffee":"lib.coffee"}]},{},["index.coffee"], null)
//# sourceMappingURL=src.c446bcbc.map