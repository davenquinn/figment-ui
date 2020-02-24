/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React, {Component, isValidElement} from 'react';
import h from '~/hyper';
import {BundlerError} from './error';
import {findDOMNode, render} from 'react-dom';
import {unwrapESModule} from '~/util';

const isReactComponent = function(fn){
  if (typeof fn !== 'function') { return false; }
  // We can guarantee that something is a React component if any of these
  // conditions are met
  if (fn.propTypes != null) { return true; }
  if ((fn.prototype != null) && (fn.prototype.isReactComponent != null) && fn.prototype.isReactComponent) { return true; }
  if ((fn.isReactComponent != null) && fn.isReactComponent) { return true; }
  return false;
};

class TaskElement extends Component {
  static initClass() {
    this.defaultProps = {
      code: null,
      opts: {},
      callback: null
    };
  }
  constructor(props){
    super(props);
    this.runTask = this.runTask.bind(this);
    this.state = {
      error: null,
      errorInfo: null
    };
  }

  componentDidCatch(error, errorInfo){
    // Catch errors in any components below and re-render with error message
    console.log("We caught an error!");
    return this.setState({
      error,
      errorInfo
    });
  }

  render() {
    let {code, opts} = this.props;
    if (code == null) { return null; }
    code = unwrapESModule(code);

    const {error, errorInfo} = this.state;
    this.isReact = false;
    if (error != null) {
      // Error path
      //console.log error, errorInfo
      return h(BundlerError, {error, details: errorInfo});
    }
    if (isValidElement(code)) {
      return h('div.element-container', [code]);
    }
    if (isReactComponent(code)) {
      // We must have a React component
      return h('div.element-container', [
        h(code, opts)
      ]);
    }
    return h('div.element-container');
  }

  runTask() {
    let {code, opts, callback} = this.props;
    if (code == null) { return; }
    if (this.state.error != null) { return; }
    console.log(code);
    code = unwrapESModule(code);
    if (isValidElement(code) || isReactComponent(code)) { return; }

    console.log("Running code from bundle");

    if (callback == null) { callback = function() {}; }

    const el = findDOMNode(this);
    try {
      return code(el, opts, callback);
    } catch (err) {
      return this.setState({error: err});
    }
  }

  computeWidth() {
    const el = findDOMNode(this);
    if ((el == null)) { return; }
    if ((el.firstChild == null)) { return; }
    const rect = el.firstChild.getBoundingClientRect();
    return this.props.recordSize(rect);
  }

  componentDidMount() {
    this.runTask();
    return this.computeWidth();
  }

  componentDidUpdate(prevProps){
    if (prevProps.code === this.props.code) { return; }
    console.log("Code was updated");
    this.runTask();
    return this.computeWidth();
  }
}
TaskElement.initClass();

class TaskStylesheet extends Component {
  render() {
    return h('style', {type: 'text/css'});
  }
  mountStyles() {
    const el = findDOMNode(this);
    const {styles} = this.props;
    if (styles == null) { return; }
    return el.appendChild(document.createTextNode(styles));
  }
  componentDidMount() {
    return this.mountStyles();
  }
  componentDidUpdate(prevProps){
    if (prevProps.styles === this.props.styles) { return; }
    return this.mountStyles();
  }
}

export {TaskElement, TaskStylesheet};
