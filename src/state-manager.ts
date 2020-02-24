/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {Component, createContext} from 'react';
import h from '~/hyper';
import update from 'immutability-helper';
import {remote, ipcRenderer} from 'electron';
import Promise from 'bluebird';
const {spawn} = require('child_process');
import {parse} from 'path';
import 'devtools-detect';
import {printFigureArea} from './print';
import Visualizer from "./visualizer";

// For backwards compatibility
global.Printer = Visualizer;

const AppStateContext = createContext({});

const nameForTask = function(task){
  let {name, outfile} = task;
  if ((name == null)) {
    ({name} = parse(outfile));
  }
  return name.replace(/[-_]/g," ");
};

class AppStateManager extends Component {
  constructor(props){
    super(props);
    this.shouldListTasks = this.shouldListTasks.bind(this);
    this.selectedTask = this.selectedTask.bind(this);
    this.__createSpec = this.__createSpec.bind(this);
    this.__getSpecs = this.__getSpecs.bind(this);
    this.openEditor = this.openEditor.bind(this);
    this.selectTask = this.selectTask.bind(this);
    this.updateState = this.updateState.bind(this);
    this.toggleDevTools = this.toggleDevTools.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    const options = remote.getGlobal('options');
    const appState = remote.getGlobal('appState');

    this.state = {
      taskLists: null,
      // We should improve this
      isPrinting: false,
      error: null,
      ...options,
      ...appState
    };
    this.defineTasks(options);
  }

  shouldListTasks() {
    const {taskLists} = this.state;
    if (taskLists == null) { return false; }
    if (taskLists.length === 1) {
      return taskLists[0].tasks.length !== 1;
    }
    return true;
  }

  selectedTask() {
    const {selectedTaskHash, taskLists} = this.state;
    if (taskLists == null) { return null; }
    if (!this.shouldListTasks()) {
      return taskLists[0].tasks[0];
    }

    for (let taskList of Array.from(taskLists)) {
      for (let task of Array.from(taskList.tasks)) {
        if (task.hash === selectedTaskHash) {
          return task;
        }
      }
    }
    return null;
  }

  __createSpec(options){
    // These should really be applied separately to each part
    const {multiPage, pageSize} = this.state;
    const spec = new Visualizer();
    spec.task(options.outfile, options.infile, {
      multiPage, pageSize
    });
    return Promise.resolve([spec]);
  }

  __getSpecs(options){
    const {specs} = options;
    // If we are in spec mode
    if ((specs == null)) {
      return this.__createSpec(options);
    }
    return Promise.map(specs, function(d){
      try {
        // Require using ESM module
        const res = __non_webpack_require__(`${d}`);
        return Promise.resolve(res)
          .then(function(v){
            v.name = d;
            return v;
        });
      } catch (err) {
        return Promise.reject(err);
      }
    });
  }


  defineTasks = async options=> {
    let res;
    try {
      res = await this.__getSpecs(options);
    } catch (error) {
      const err = error;
      this.updateState({error: {$set: err}});
    }
    return this.updateState({taskLists: {$set: res}});
  };

  openEditor() {
    const task = this.selectedTask();
    if (task == null) { return; }
    return spawn(process.env.EDITOR, [task.code], {detached: true});
  }

  selectTask(task){
    let hash = null;
    if (task != null) {
      ({
        hash
      } = task);
    }
    return this.updateState({selectedTaskHash: {$set: hash}});
  }

  render() {
    const methods = (() => { let openEditor, selectTask, toggleDevTools;
    return ({toggleDevTools, openEditor, selectTask} = this); })();
    const selectedTask = this.selectedTask();
    const value = {
      update: this.updateState,
      printFigureArea: this.printFigureArea,
      hasTaskList: this.shouldListTasks(),
      nameForTask,
      ...methods,
      ...this.state,
      selectedTask
    };

    return h(AppStateContext.Provider, {value}, this.props.children);
  }

  updateState(spec){
    const newState = update(this.state,spec);
    this.setState(newState);
    // forward state to main process
    const appState = (function() { let devToolsEnabled, selectedTaskHash, toolbarEnabled, zoomLevel;
    return ({
      toolbarEnabled,
      selectedTaskHash,
      devToolsEnabled,
      zoomLevel } = newState); })();
    return ipcRenderer.send('update-state', appState);
  }

  toggleDevTools() {
    this.updateState({devToolsEnabled: {$set: true}});
    ipcRenderer.send('dev-tools');
    const win = remote.getCurrentWindow();
    return win.openDevTools();
  }

  componentDidMount() {
    ipcRenderer.on('show-toolbar', (event, toolbarEnabled)=> {
      return this.updateState({toolbarEnabled: {$set: toolbarEnabled}});
  });

    ipcRenderer.on('zoom', (event, zoom)=> {
      return this.updateState({zoomLevel: {$set: zoom}});
  });

    ipcRenderer.on('update-state', (event, state)=> {
      console.log("Updating state from main process");
      return this.setState({...state});
  });

    return window.addEventListener('devtoolschange', event=> {
      const {isOpen} = event.detail;
      return this.updateState({devToolsEnabled: {$set: isOpen}});
  });
  }

  printFigureArea = async () => {
    const task = this.selectedTask();
    this.setState({isPrinting: true});
    try {
      await printFigureArea(task);
    } catch (error1) {
      const err = error1;
      console.error(err);
    }
    return this.setState({isPrinting: false});
  };
}

export {AppStateContext, AppStateManager};
