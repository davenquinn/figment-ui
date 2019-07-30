process.env.HMR_PORT=0;process.env.HMR_HOSTNAME="localhost";// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
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
      localRequire.cache = {};

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

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
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
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"main.styl":[function(require,module,exports) {
"use strict";

module.exports = {
  "figure-container-outer": "_figure-container-outer_4f18e",
  "figure-container-inner": "_figure-container-inner_4f18e",
  "figure-container": "_figure-container_4f18e",
  "ui-controls": "_ui-controls_4f18e",
  "ui-controls-hidden": "_ui-controls-hidden_4f18e",
  "toolbar-toggle-button": "_toolbar-toggle-button_4f18e",
  "progress": "_progress_4f18e",
  "buttons": "_buttons_4f18e",
  "right-buttons": "_right-buttons_4f18e",
  "linear-progress-bar-stripes": "_linear-progress-bar-stripes_4f18e",
  "skeleton-glow": "_skeleton-glow_4f18e",
  "pt-spinner-animation": "_pt-spinner-animation_4f18e"
};
},{}],"types.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertShape = void 0;

var _checkPropTypes = require("check-prop-types");

var assertShape;
exports.assertShape = assertShape;

exports.assertShape = assertShape = function (data, shape, subject = "data", object = "application") {
  var res;
  res = (0, _checkPropTypes.assertPropTypes)({
    v: shape.isRequired
  }, {
    v: data
  }, subject, object);

  if (res != null) {
    throw res;
  }
};
},{}],"task/types.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskShape = void 0;

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var TaskShape;
exports.TaskShape = TaskShape;
exports.TaskShape = TaskShape = _propTypes["default"].shape({
  multiPage: _propTypes["default"].bool.isRequired
});
},{}],"lib.coffee":[function(require,module,exports) {
"use strict";

var _main = _interopRequireDefault(require("./main.styl"));

var _types = require("~/types");

var _types2 = require("./task/types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Printer, Promise, colors, createHash, d3, fs, ipcRenderer, options, path, pixelsToMicrons, printFigureArea, printToImage, printToPDF, remote, sleep, waitForUserInput;
Promise = require('bluebird');
fs = require('fs');
({
  remote,
  ipcRenderer
} = require('electron'));
({
  createHash
} = require('crypto'));
path = require('path');
d3 = require('d3-selection');
colors = require('colors/safe');
options = remote.getGlobal('options' || {});

if (options.dpi == null) {
  options.dpi = 96;
}

options.log = false;

waitForUserInput = function (data) {
  return new Promise(function (resolve, reject) {
    ipcRenderer.once('done-waiting', function () {
      return resolve(data);
    });
    return ipcRenderer.send('wait-for-input');
  });
};

sleep = function (data) {
  return new Promise(function (resolve, reject) {
    var fn;

    fn = function () {
      return resolve(data);
    };

    return setTimeout(fn, 1000);
  });
};

pixelsToMicrons = function (px) {
  return Math.ceil(px / 96.0 * 25400);
};

printToPDF = function (webview, opts) {
  return new Promise(function (resolve, reject) {
    /*
    Print the webview to the callback
    */
    var controls, el, height, oldDisplay, pageSize, scaleFactor, wc, width;
    el = document.getElementsByClassName(_main["default"]["figure-container-inner"])[0];
    controls = document.getElementsByClassName(_main["default"]["ui-controls"])[0]; // pageSize can be A3, A4, A5, Legal, Letter, Tabloid or an Object
    // containing height and width in microns.
    // (https://electronjs.org/docs/api/web-contents)

    ({
      pageSize,
      width,
      height,
      scaleFactor
    } = opts);

    if (pageSize == null) {
      pageSize = {
        height: pixelsToMicrons(height * scaleFactor),
        width: pixelsToMicrons(width * scaleFactor)
      };
    }

    opts = {
      printBackground: true,
      marginsType: 1,
      pageSize
    };
    console.log(opts);
    el.style.transform = `scale(${scaleFactor})`;
    el.style.transformOrigin = "top left";
    oldDisplay = controls.style.display;
    controls.style.display = "none";
    ({
      webContents: wc
    } = remote.getCurrentWindow());
    return wc.printToPDF(opts, (e, data) => {
      if (e != null) {
        reject(e);
      }

      resolve(data);
      el.style.transform = null;
      el.style.transformOrigin = null;
      return controls.style.display = oldDisplay;
    });
  });
};

printToImage = function (webview, opts) {
  return new Promise(function (resolve, reject) {
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

    ({
      width,
      height
    } = opts);
    width *= opts.scaleFactor;
    height *= opts.scaleFactor;
    rect = {
      x: 0,
      y: 30,
      width,
      height
    };
    console.log(rect);
    return webview.capturePage(rect, function (image) {
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

printFigureArea = async function (task) {
  var buf, dir, el, ext, height, opts, outfile, pageSize, scaleFactor, wc, width;
  /*
   * Function to print webpage
   */

  (0, _types.assertShape)(task, _types2.TaskShape);
  console.log(task);
  opts = task.opts || {};
  ({
    scaleFactor
  } = opts);

  if (scaleFactor == null) {
    scaleFactor = 1;
  }

  el = document.querySelector(`.${_main["default"]['figure-container-inner']}>*:first-child`);
  ({
    width,
    height
  } = el.getBoundingClientRect());
  opts = {
    width,
    height,
    scaleFactor
  };
  ({
    outfile
  } = task);
  dir = path.dirname(outfile);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  console.log(`Printing to ${outfile}`);
  ext = path.extname(outfile);
  wc = remote.getCurrentWebContents();

  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    opts.format = ext.slice(1);
    buf = await printToImage(wc, opts);
  } else {
    // Set pageSize from task
    ({
      pageSize
    } = task.opts);
    opts.pageSize = pageSize;
    buf = await printToPDF(wc, opts);
  }

  console.log(`${outfile}`);
  fs.writeFileSync(outfile, buf);
  return console.log("Finished task");
}; // Initialize renderer


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
    } // Check if we've got a function or string


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
    } //f = require fn
    //f(el, cb)


    console.log(this.options); // Apply build directory

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
      multiPage: opts.multiPage,
      opts: opts
    });
    return this;
  }

  run() {}

}; // Progress through list of figures, print
// each one to file
// TODO: fix this mode of operation
// __runTask = (t)->
//   console.log "#{t.code} ⇒ #{t.outfile}"
//   p = generateFigure(t)
//   if options.waitForUser
//     p = p.then waitForUserInput
//   p.then printFigureArea
//     .catch (e)->console.log('Error: '+e)
// Promise
//   .map @tasks, __runTask, concurrency: 1

module.exports = {
  Printer,
  printFigureArea
};
},{"./main.styl":"main.styl","~/types":"types.coffee","./task/types":"task/types.coffee"}],"state-manager.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppStateManager = exports.AppStateContext = void 0;

var _react = require("react");

var _reactHyperscript = _interopRequireDefault(require("react-hyperscript"));

var _immutabilityHelper = _interopRequireDefault(require("immutability-helper"));

var _electron = require("electron");

var _bluebird = _interopRequireDefault(require("bluebird"));

var _path = require("path");

require("devtools-detect");

var _lib = require("./lib.coffee");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var AppStateContext,
    AppStateManager,
    getSpecs,
    nameForTask,
    spawn,
    boundMethodCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

exports.AppStateManager = AppStateManager;
exports.AppStateContext = AppStateContext;
({
  spawn
} = require('child_process'));
window.Printer = _lib.Printer;
exports.AppStateContext = AppStateContext = (0, _react.createContext)({});

getSpecs = function (d) {
  var res;
  res = require(d);
  return _bluebird["default"].resolve(res).then(function (v) {
    v.name = d;
    return v;
  });
};

nameForTask = function (task) {
  var name, outfile;
  ({
    name,
    outfile
  } = task);

  if (name == null) {
    ({
      name
    } = (0, _path.parse)(outfile));
  }

  return name.replace(/[-_]/g, " ");
};

exports.AppStateManager = AppStateManager = class AppStateManager extends _react.Component {
  constructor(props) {
    var appState, options;
    super(props);
    this.shouldListTasks = this.shouldListTasks.bind(this);
    this.selectedTask = this.selectedTask.bind(this);
    this.defineTasks = this.defineTasks.bind(this);
    this.openEditor = this.openEditor.bind(this);
    this.selectTask = this.selectTask.bind(this);
    this.updateState = this.updateState.bind(this);
    this.toggleDevTools = this.toggleDevTools.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.printFigureArea = this.printFigureArea.bind(this);
    options = _electron.remote.getGlobal('options');
    appState = _electron.remote.getGlobal('appState');
    this.state = {
      taskLists: null,
      // We should improve this
      ...options,
      ...appState
    };
    this.defineTasks(options);
  }

  shouldListTasks() {
    var taskLists;
    boundMethodCheck(this, AppStateManager);
    ({
      taskLists
    } = this.state);

    if (taskLists == null) {
      return false;
    }

    if (taskLists.length === 1) {
      return taskLists[0].tasks.length !== 1;
    }

    return true;
  }

  selectedTask() {
    var i, j, len, len1, ref, selectedTaskHash, task, taskList, taskLists;
    boundMethodCheck(this, AppStateManager);
    ({
      selectedTaskHash,
      taskLists
    } = this.state);

    if (taskLists == null) {
      return null;
    }

    if (!this.shouldListTasks()) {
      return taskLists[0].tasks[0];
    }

    for (i = 0, len = taskLists.length; i < len; i++) {
      taskList = taskLists[i];
      ref = taskList.tasks;

      for (j = 0, len1 = ref.length; j < len1; j++) {
        task = ref[j];

        if (task.hash === selectedTaskHash) {
          return task;
        }
      }
    }

    return null;
  }

  async defineTasks(options) {
    var multiPage, p, pageSize, res, spec, specs;
    boundMethodCheck(this, AppStateManager);
    ({
      specs
    } = options); // These should really be applied separately to each part

    ({
      multiPage,
      pageSize
    } = this.state); // If we are in spec mode

    if (specs != null) {
      p = _bluebird["default"].map(specs, getSpecs);
    } else {
      spec = new _lib.Printer();
      spec.task(options.outfile, options.infile, {
        multiPage,
        pageSize
      });
      p = _bluebird["default"].resolve([spec]);
    }

    res = await p;
    return this.updateState({
      taskLists: {
        $set: res
      }
    });
  }

  openEditor() {
    var task;
    boundMethodCheck(this, AppStateManager);
    task = this.selectedTask();

    if (task == null) {
      return;
    }

    return spawn(process.env.EDITOR, [task.code], {
      detached: true
    });
  }

  selectTask(task) {
    var hash;
    boundMethodCheck(this, AppStateManager);
    hash = null;

    if (task != null) {
      hash = task.hash;
    }

    return this.updateState({
      selectedTaskHash: {
        $set: hash
      }
    });
  }

  render() {
    var methods, selectedTask, value;

    methods = (() => {
      var openEditor, selectTask, toggleDevTools;
      return ({
        toggleDevTools,
        openEditor,
        selectTask
      } = this);
    })();

    selectedTask = this.selectedTask();
    value = {
      update: this.updateState,
      printFigureArea: this.printFigureArea,
      hasTaskList: this.shouldListTasks(),
      nameForTask,
      ...methods,
      ...this.state,
      selectedTask
    };
    return (0, _reactHyperscript["default"])(AppStateContext.Provider, {
      value
    }, this.props.children);
  }

  updateState(spec) {
    var appState, newState;
    boundMethodCheck(this, AppStateManager);
    newState = (0, _immutabilityHelper["default"])(this.state, spec);
    this.setState(newState); // forward state to main process

    appState = function () {
      var devToolsEnabled, selectedTaskHash, toolbarEnabled, zoomLevel;
      return ({
        toolbarEnabled,
        selectedTaskHash,
        devToolsEnabled,
        zoomLevel
      } = newState);
    }();

    return _electron.ipcRenderer.send('update-state', appState);
  }

  toggleDevTools() {
    var win;
    boundMethodCheck(this, AppStateManager);
    this.updateState({
      devToolsEnabled: {
        $set: true
      }
    });

    _electron.ipcRenderer.send('dev-tools');

    win = _electron.remote.getCurrentWindow();
    return win.openDevTools();
  }

  componentDidMount() {
    boundMethodCheck(this, AppStateManager);

    _electron.ipcRenderer.on('show-toolbar', (event, toolbarEnabled) => {
      return this.updateState({
        toolbarEnabled: {
          $set: toolbarEnabled
        }
      });
    });

    _electron.ipcRenderer.on('zoom', (event, zoom) => {
      return this.updateState({
        zoomLevel: {
          $set: zoom
        }
      });
    });

    _electron.ipcRenderer.on('update-state', (event, state) => {
      console.log("Updating state from main process");
      return this.setState({ ...state
      });
    });

    return window.addEventListener('devtoolschange', event => {
      var isOpen;
      ({
        isOpen
      } = event.detail);
      return this.updateState({
        devToolsEnabled: {
          $set: isOpen
        }
      });
    });
  }

  printFigureArea() {
    var task;
    boundMethodCheck(this, AppStateManager);
    task = this.selectedTask();
    return (0, _lib.printFigureArea)(task);
  }

};
},{"./lib.coffee":"lib.coffee"}],"task-list/styles.styl":[function(require,module,exports) {
"use strict";

module.exports = {
  "task-list": "_task-list_ed53f",
  "prefix": "_prefix_ed53f"
};
},{}],"task-list/index.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskListItem = exports.TaskList = void 0;

var _react = require("react");

var _stateManager = require("../state-manager");

var _hyper = require("@macrostrat/hyper");

var _styles = _interopRequireDefault(require("./styles.styl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var TaskList,
    TaskListItem,
    TaskListSection,
    h,
    sharedStart,
    boundMethodCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

exports.TaskListItem = TaskListItem;
exports.TaskList = TaskList;
h = (0, _hyper.hyperStyled)(_styles["default"]);

sharedStart = function (array) {
  var A, L, a1, a2, i; // From
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

exports.TaskListItem = TaskListItem = function () {
  class TaskListItem extends _react.Component {
    constructor() {
      super(...arguments);
      this.onClick = this.onClick.bind(this);
    }

    onClick() {
      var task;
      boundMethodCheck(this, TaskListItem);
      ({
        task
      } = this.props);
      return this.context.selectTask(task);
    }

    render() {
      var displayName, task;
      ({
        task,
        displayName
      } = this.props);
      return h('li', null, h('a', {
        href: `#${task.hash}`,
        onClick: this.onClick
      }, displayName));
    }

  }

  ;
  TaskListItem.contextType = _stateManager.AppStateContext;
  return TaskListItem;
}.call(void 0);

TaskListSection = function (props) {
  var arr, name, prefix, tasks;
  ({
    tasks,
    name
  } = props);

  if (name == null) {
    name = "Tasks";
  } // Render spec list from runner
  // Find shared starting substring


  arr = tasks.map(function (d) {
    return d.outfile;
  });
  arr.push(name);
  prefix = sharedStart(arr);
  return h('div.task-list', [h('h2', [h('span.prefix', prefix), h('span.name', name.slice(prefix.length))]), h('ul', tasks.map(function (task) {
    var displayName;
    displayName = task.outfile.slice(prefix.length);
    return h(TaskListItem, {
      displayName,
      task
    });
  }))]);
};

exports.TaskList = TaskList = function ({
  runners
}) {
  return h('div', runners.map(function (d) {
    return h(TaskListSection, d);
  }));
};
},{"../state-manager":"state-manager.coffee","./styles.styl":"task-list/styles.styl"}],"hyper.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _hyper = require("@macrostrat/hyper");

var _main = _interopRequireDefault(require("~/main.styl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var h;
h = (0, _hyper.hyperStyled)(_main["default"]);
var _default = h;
exports["default"] = _default;
},{"~/main.styl":"main.styl"}],"ui-controls.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UIControls = void 0;

var _core = require("@blueprintjs/core");

var _react = require("react");

var _stateManager = require("./state-manager");

var _taskList = require("./task-list");

var _hyper = _interopRequireDefault(require("~/hyper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var BackButton, CurrentTaskName, DevToolsButton, EditorButton, MinimalUIControls, PrintButton, ToolButton, ToolbarToggleButton, UIControls;
exports.UIControls = UIControls;

ToolButton = function (props) {
  return (0, _hyper["default"])(_core.Button, {
    small: true,
    minimal: true,
    ...props
  });
};

DevToolsButton = function () {
  class DevToolsButton extends _react.Component {
    render() {
      var disabled, onClick;
      onClick = this.context.toggleDevTools;
      disabled = this.context.devToolsEnabled;
      return (0, _hyper["default"])(ToolButton, {
        onClick,
        disabled,
        rightIcon: 'code'
      }, "DevTools");
    }

  }

  ;
  DevToolsButton.contextType = _stateManager.AppStateContext;
  return DevToolsButton;
}.call(void 0);

BackButton = function () {
  class BackButton extends _react.Component {
    render() {
      var onClick;

      if (this.context.selectedTask == null) {
        return null;
      }

      if (!this.context.hasTaskList) {
        return null;
      }

      onClick = () => {
        return this.context.selectTask(null);
      };

      return (0, _hyper["default"])(ToolButton, {
        icon: 'caret-left',
        onClick
      }, 'Back to list');
    }

  }

  ;
  BackButton.contextType = _stateManager.AppStateContext;
  return BackButton;
}.call(void 0);

PrintButton = function () {
  class PrintButton extends _react.Component {
    render() {
      var onClick, printFigureArea;
      ({
        printFigureArea
      } = this.context);

      onClick = function () {
        return printFigureArea();
      };

      return (0, _hyper["default"])(ToolButton, {
        rightIcon: 'print',
        onClick,
        intent: _core.Intent.PRIMARY
      }, 'Print');
    }

  }

  ;
  PrintButton.contextType = _stateManager.AppStateContext;
  return PrintButton;
}.call(void 0);

EditorButton = function () {
  class EditorButton extends _react.Component {
    render() {
      return (0, _hyper["default"])(ToolButton, {
        icon: 'edit',
        onClick: this.context.openEditor
      }, 'Open editor');
    }

  }

  ;
  EditorButton.contextType = _stateManager.AppStateContext;
  return EditorButton;
}.call(void 0);

CurrentTaskName = function (props) {
  var nameForTask, selectedTask;
  ({
    selectedTask,
    nameForTask
  } = (0, _react.useContext)(_stateManager.AppStateContext));

  if (selectedTask == null) {
    return null;
  }

  return (0, _hyper["default"])('h1.task-name.bp3-text', nameForTask(selectedTask));
};

ToolbarToggleButton = function (props) {
  var icon, intent, onClick, toolbarEnabled, update;
  ({
    update,
    toolbarEnabled
  } = (0, _react.useContext)(_stateManager.AppStateContext));

  onClick = function () {
    return update({
      $toggle: ['toolbarEnabled']
    });
  };

  intent = null;
  icon = 'menu';

  if (toolbarEnabled) {
    icon = 'eye-off';
  }

  return (0, _hyper["default"])(ToolButton, {
    minimal: true,
    icon,
    intent,
    onClick,
    className: 'toolbar-toggle-button',
    ...props
  });
};

MinimalUIControls = function () {
  return (0, _hyper["default"])('div.ui-controls-hidden', [(0, _hyper["default"])(ToolbarToggleButton, {
    small: false
  })]);
};

exports.UIControls = UIControls = function () {
  class UIControls extends _react.Component {
    render() {
      var hasTaskList, selectedTask, toolbarEnabled;
      ({
        hasTaskList,
        selectedTask,
        toolbarEnabled
      } = this.context);

      if (!toolbarEnabled) {
        return (0, _hyper["default"])(MinimalUIControls);
      }

      return (0, _hyper["default"])('div.ui-controls', [(0, _hyper["default"])('div.left-buttons', [(0, _hyper["default"])(BackButton), (0, _hyper["default"])(CurrentTaskName)]), (0, _hyper["default"])('div.right-buttons', [(0, _hyper["default"])(DevToolsButton), _hyper["default"]["if"](selectedTask != null)([(0, _hyper["default"])(PrintButton)]), (0, _hyper["default"])('span.separator'), (0, _hyper["default"])(ToolbarToggleButton)])]);
    }

  }

  ;
  UIControls.contextType = _stateManager.AppStateContext;
  return UIControls;
}.call(void 0);
},{"./state-manager":"state-manager.coffee","./task-list":"task-list/index.coffee","~/hyper":"hyper.coffee"}],"task/elements.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskStylesheet = exports.TaskElement = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactHyperscript = _interopRequireDefault(require("react-hyperscript"));

var _reactDom = require("react-dom");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

var ErrorBoundary,
    TaskElement,
    TaskStylesheet,
    boundMethodCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

exports.TaskStylesheet = TaskStylesheet;
exports.TaskElement = TaskElement;
ErrorBoundary = class ErrorBoundary extends _react["default"].Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null
    };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    return this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return _react["default"].createElement("div", null, _react["default"].createElement("h2", null, "Something went wrong."), _react["default"].createElement("details", {
        style: {
          whiteSpace: 'pre-wrap'
        }
      }, this.state.error && this.state.error.toString(), _react["default"].createElement("br", null), this.state.errorInfo.componentStack));
    }

    return this.props.children;
  }

};

exports.TaskElement = TaskElement = function () {
  class TaskElement extends _react.Component {
    constructor(props) {
      super(props);
      this.runTask = this.runTask.bind(this);
    }

    render() {
      var children, code;
      ({
        code
      } = this.props);

      if (code == null) {
        return null;
      }

      try {
        children = (0, _reactHyperscript["default"])(ErrorBoundary, [(0, _reactHyperscript["default"])(code)]);
        return (0, _reactHyperscript["default"])('div', {
          children
        });
      } catch (error1) {
        return (0, _reactHyperscript["default"])('div');
      }
    }

    runTask() {
      var callback, code, el;
      boundMethodCheck(this, TaskElement);
      ({
        code,
        callback
      } = this.props);

      if (code == null) {
        return;
      }

      return;
      console.log("Running code from bundle"); // React components are handled directly
      //return
      // Here is where we would accept different
      // types of components

      if (callback == null) {
        callback = function () {};
      }

      el = (0, _reactDom.findDOMNode)(this);
      return (0, _reactDom.render)((0, _reactHyperscript["default"])(code), el, callback);
    }

    componentDidMount() {
      return this.runTask();
    }

    componentDidUpdate(prevProps) {
      if (prevProps.code === this.props.code) {
        return;
      }

      console.log("Code was updated");
      return this.runTask();
    }

  }

  ;
  TaskElement.defaultProps = {
    code: null,
    callback: null
  };
  return TaskElement;
}.call(void 0);

exports.TaskStylesheet = TaskStylesheet = class TaskStylesheet extends _react.Component {
  render() {
    return (0, _reactHyperscript["default"])('style', {
      type: 'text/css'
    });
  }

  mountStyles() {
    var el, styles;
    el = (0, _reactDom.findDOMNode)(this);
    ({
      styles
    } = this.props);

    if (styles == null) {
      return;
    }

    return el.appendChild(document.createTextNode(styles));
  }

  componentDidMount() {
    return this.mountStyles();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.styles === this.props.styles) {
      return;
    }

    return this.mountStyles();
  }

};
},{}],"../bundler/index.js":[function(require,module,exports) {
"use strict";

const {
  spawn
} = require('child_process');

const {
  ipcRenderer,
  remote
} = require('electron');

const path = require('path');

const isRenderer = require('is-electron-renderer');

const debug = false;

function printLine(obj) {
  let line; // Convert to string if needed

  if (typeof obj === 'string' || obj instanceof String) {
    line = obj;
  } else {
    line = JSON.stringify(obj);
  }

  ipcRenderer.send('bundle-log', line);
}

async function printToStdout(child) {
  for await (const data of child.stdout) {
    let line = data.toString('utf8');
    printLine(line);
  }

  ;
}

;

const runBundler = function (inFile, options = {}) {
  let env, runner, bundlerScript;
  env = Object.create(remote.process.env);
  runner = process.argv[0];
  bundlerScript = remote.getGlobal('bundlerScript');
  env.ELECTRON_RUN_AS_NODE = '1';
  env.FORCE_COLOR = true;
  const opts = JSON.stringify(options);
  const proc = spawn(runner, [bundlerScript, inFile, opts], {
    env: env,
    detached: false,
    stdio: ['pipe', 'pipe', 'inherit', 'ipc']
  });
  proc.on('message', bundle => {
    if (debug) printLine(bundle);
  });
  printToStdout(proc); // Record PID for later killing

  ipcRenderer.send('new-process', proc.pid);
  console.log(`Started process ${proc.pid}`);
  return proc;
};

module.exports = {
  runBundler
};
},{}],"task/index.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "TaskShape", {
  enumerable: true,
  get: function () {
    return _types.TaskShape;
  }
});
exports.TaskRenderer = void 0;

var _react = require("react");

var _hyper = _interopRequireDefault(require("~/hyper"));

var _core = require("@blueprintjs/core");

var _elements = require("./elements");

var _types = require("./types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var TaskRenderer,
    fs,
    path,
    runBundler,
    boundMethodCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

exports.TaskRenderer = TaskRenderer;
path = require('path');
fs = require('fs');
({
  runBundler
} = require('../../bundler'));

exports.TaskRenderer = TaskRenderer = function () {
  class TaskRenderer extends _react.Component {
    constructor(props) {
      super(props);
      this.startBundler = this.startBundler.bind(this);
      this.onBundlingStarted = this.onBundlingStarted.bind(this);
      this.onBundlingFinished = this.onBundlingFinished.bind(this);
      this.bundler = null;
      this.state = {
        code: null,
        styles: null
      };
    }

    render() {
      var code, styles;
      ({
        code,
        styles
      } = this.state);

      if (code == null && styles == null) {
        return (0, _hyper["default"])('div.progress', [(0, _hyper["default"])(_core.Spinner), (0, _hyper["default"])('p', "Bundling code")]);
      }

      return (0, _hyper["default"])('div.figure-container-inner', [(0, _hyper["default"])(_elements.TaskStylesheet, {
        styles
      }), (0, _hyper["default"])(_elements.TaskElement, {
        code
      })]);
    }

    startBundler() {
      var cacheDir, codeFile, dn, outDir, task;
      boundMethodCheck(this, TaskRenderer);

      if (this.bundler != null) {
        /*
         * This is the function that actually runs a discrete task
         */
        this.bundler.kill(0);
      }

      ({
        task
      } = this.props);
      console.log("Running task");
      ({
        code: codeFile
      } = task); // The file that has the code in it...

      dn = path.dirname(path.resolve(codeFile));
      cacheDir = path.join(dn, '.cache');
      outDir = path.join(cacheDir, 'build');
      this.bundler = runBundler(codeFile, {
        outDir,
        cacheDir,
        cache: true,
        contentHash: true
      });
      console.log(`Running bundler process with PID ${this.bundler.pid}`);
      process.on('exit', () => {
        return this.bundler.kill();
      });
      return this.bundler.on('message', bundle => {
        if (bundle.message === 'buildStart') {
          this.onBundlingStarted(bundle);
        }

        if (bundle.message === 'bundled') {
          return this.onBundlingFinished(bundle, outDir);
        }
      });
    }

    onBundlingStarted(bundle) {
      boundMethodCheck(this, TaskRenderer);
      console.log("Bundling started");
      return this.setState({
        code: null,
        styles: null
      });
    }

    onBundlingFinished(bundle, outDir) {
      var code, compiledCode, cssFile, styles;
      boundMethodCheck(this, TaskRenderer);
      console.log("Bundling done");

      if (bundle.type !== 'js') {
        throw "Only javascript output is supported (for now)";
      } // Get css and javascript


      cssFile = path.join(outDir, 'index.css');
      styles = null;

      if (fs.existsSync(cssFile)) {
        styles = fs.readFileSync(cssFile, 'utf-8');
      }

      compiledCode = bundle.name;
      console.log(`Requiring compiled code from ${bundle.name}`);
      delete require.cache[require.resolve(compiledCode)];
      code = require(compiledCode);
      return this.setState({
        code,
        styles
      });
    }

    componentDidMount() {
      var task;
      ({
        task
      } = this.props);

      if (task == null) {
        return;
      }

      return this.startBundler(task);
    }

    componentDidUpdate(prevProps) {
      var task;
      ({
        task
      } = this.props);

      if (prevProps.task === task) {
        return;
      }

      return this.startBundler(task);
    }

    componentWillUnmount() {
      if (this.bundler == null) {
        return;
      }

      return this.bundler.kill(0);
    }

  }

  ;
  TaskRenderer.propTypes = {
    task: _types.TaskShape.isRequired
  };
  return TaskRenderer;
}.call(void 0);
},{"~/hyper":"hyper.coffee","./elements":"task/elements.coffee","./types":"task/types.coffee","../../bundler":"../bundler/index.js"}],"figure-container.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FigureContainer = void 0;

var _hyper = _interopRequireDefault(require("~/hyper"));

var _react = require("react");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _task = require("./task");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var FigureContainer;
exports.FigureContainer = FigureContainer;

exports.FigureContainer = FigureContainer = function () {
  class FigureContainer extends _react.Component {
    render() {
      var height, marginTop, multiPage, style, task, z, zoomLevel;
      ({
        zoomLevel,
        task,
        marginTop
      } = this.props); // We shouldn't have this nested structure, it's confusing

      ({
        multiPage
      } = task.opts);

      if (multiPage == null) {
        multiPage = false;
      }

      height = multiPage ? null : "100vh";
      z = zoomLevel === 1 ? null : `scale(${zoomLevel})`;
      style = {
        transform: z,
        transformOrigin: "0px 0px",
        padding: `${20 / zoomLevel}px`
      };
      return (0, _hyper["default"])('div.figure-container-outer', {
        style: {
          height,
          marginTop
        }
      }, [(0, _hyper["default"])('div.figure-container', {
        style
      }, [_hyper["default"]["if"](task != null)(_task.TaskRenderer, {
        task,
        key: task
      })])]);
    }

  }

  ;
  FigureContainer.defaultProps = {
    zoomLevel: 1,
    marginTop: null
  };
  FigureContainer.propTypes = {
    task: _task.TaskShape,
    marginTop: _propTypes["default"].integer
  };
  return FigureContainer;
}.call(void 0);
},{"~/hyper":"hyper.coffee","./task":"task/index.coffee"}],"index.coffee":[function(require,module,exports) {
"use strict";

require("@babel/polyfill");

var _core = require("@blueprintjs/core");

var _react = require("react");

var _reactDom = require("react-dom");

var _reactHyperscript = _interopRequireDefault(require("react-hyperscript"));

var _uiControls = require("./ui-controls");

var _figureContainer = require("./figure-container");

var _stateManager = require("./state-manager");

var _taskList = require("./task-list");

require("./main.styl");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var App, AppMain, el;

_core.FocusStyleManager.onlyShowFocusOnTabs();

AppMain = function () {
  class AppMain extends _react.Component {
    renderMain() {
      var marginTop, selectedTask, taskLists, toolbarEnabled, zoomLevel;
      ({
        taskLists,
        selectedTask,
        zoomLevel,
        toolbarEnabled
      } = this.context);
      marginTop = toolbarEnabled ? "30px" : null;

      if (selectedTask != null) {
        return (0, _reactHyperscript["default"])(_figureContainer.FigureContainer, {
          task: selectedTask,
          zoomLevel,
          marginTop
        });
      }

      if (taskLists != null) {
        return (0, _reactHyperscript["default"])(_taskList.TaskList, {
          runners: taskLists
        });
      }

      return null;
    }

    render() {
      return (0, _reactHyperscript["default"])('div#app-main', [(0, _reactHyperscript["default"])(_uiControls.UIControls), this.renderMain()]);
    }

  }

  ;
  AppMain.contextType = _stateManager.AppStateContext;
  return AppMain;
}.call(void 0);

App = function () {
  return (0, _reactHyperscript["default"])(_stateManager.AppStateManager, null, (0, _reactHyperscript["default"])(AppMain));
};

el = document.querySelector("#app");
(0, _reactDom.render)((0, _reactHyperscript["default"])(App), el);
},{"./ui-controls":"ui-controls.coffee","./figure-container":"figure-container.coffee","./state-manager":"state-manager.coffee","./task-list":"task-list/index.coffee","./main.styl":"main.styl"}]},{},["index.coffee"], null)
//# sourceMappingURL=src.9d9889e0.js.map