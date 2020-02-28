/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from '~/hyper';
import {Component} from 'react';
import T from 'prop-types';
import {TaskRenderer, TaskShape} from './task';
import {MarginType} from '~/types';
import classNames from 'classnames';
import {AppStateContext} from './state-manager';

class FigureContainer extends Component {
  static initClass() {
    this.contextType = AppStateContext;
    this.defaultProps = {
      zoomLevel: 1,
      marginTop: 0,
      scaleFactor: 1
    };
    this.propTypes = {
      marginTop: MarginType,
      multiPage: T.bool.isRequired,
      scaleFactor: T.number,
      width: T.number
    };
  }
  render() {
    const {zoomLevel, task, marginTop,
     multiPage, scaleFactor, width} = this.props;
    const {isPrinting} = false // this.context;
    // We shouldn't have this nested structure, it's confusing

    const height = multiPage ? null : "100vh";

    let transform = null
    if (zoomLevel != 1 && !isPrinting) {
      transform = `scale(${zoomLevel})`
    }

    const z = ((zoomLevel === 1) || isPrinting) ? null : `scale(${zoomLevel})`;
    const style = {transform, width};

    const className = classNames({'is-printing': isPrinting});
    let padding = 20;
    if (isPrinting) {
      padding = 0;
    }

    return h('div.figure-container-outer', {style: {height, paddingTop: marginTop}, className}, [
      h('div.figure-container', {className, style: {padding, width: width+(2*padding)}}, [
        h('div.figure-container-inner', {
          className,
          style
        }, this.props.children)
      ])
    ]);
  }
}
FigureContainer.initClass();

export {FigureContainer};
