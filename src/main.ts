/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import "@babel/polyfill";
import {FocusStyleManager} from '@blueprintjs/core';
FocusStyleManager.onlyShowFocusOnTabs();

import {Component} from 'react';
import {render} from 'react-dom';
import h from '~/hyper';
import {UIControls} from './ui-controls';
import {AppStateManager, AppStateContext} from './state-manager';
import {TaskList} from './task-list';
import {TaskRenderer} from './task';
import {BundlerError} from './task/error';
import {NonIdealState, Intent} from '@blueprintjs/core';
import {AppToaster} from './toaster';
import classNames from 'classnames';
import './main.styl';

const NoTaskError = () => h('div.error-overlay.no-task', [
  h('div.bp3-ui-text.entry', [
    h("h1", "Figment"),
    h("h2", "No task defined"),
    h('div.usage', [
      h("h3", "Usage"),
      h("div.scripts", [
        h("pre.bp3-code-block", "figment entry.js figure.pdf"),
        h("pre.bp3-code-block", "figment --spec spec1.js [...]")
      ])
    ])
  ])
]);

class AppMain extends Component {
  static initClass() {
    this.contextType = AppStateContext;
  }
  renderMain() {
    const {taskLists, selectedTask, zoomLevel, toolbarEnabled, error} = this.context;
    const marginTop = toolbarEnabled ? "38px" : null;
    if (error != null) {
      return h(BundlerError, {error});
    }
    if (selectedTask != null) {
      return h(TaskRenderer, {task: selectedTask, zoomLevel, marginTop});
    }
    if (taskLists != null) {
      return h(TaskList, {runners: taskLists});
    }
    return h(NoTaskError);
  }

  render() {
    const {toolbarEnabled} = this.context;
    const className = classNames({'toolbar-disabled': !toolbarEnabled});

    return h('div.app-main', {className}, [
      h(UIControls),
      this.renderMain()
    ]);
  }
}
AppMain.initClass();

const App = () => h(AppStateManager, null, h(AppMain));

let el = document.createElement('div');
el.id = 'app';
document.body.appendChild(el);

//const el = document.querySelector("#app");
render(h(App), el);
