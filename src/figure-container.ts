/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from '~/hyper';
import {Component} from 'react';
import T from 'prop-types';
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
    const {zoomLevel, marginTop, multiPage, width, height} = this.props;
    const {isPrinting} = this.context;
    // We shouldn't have this nested structure, it's confusing

    let paddingTop = marginTop
    let factor = zoomLevel
    if (isPrinting) {
      //factor = 20
      paddingTop = 0
    }

    let transform = null
    if (factor != 1) {
      transform = `scale(${factor})`
    }

    const size = {
      width: width*factor,
      height: height*factor
    }

    let style = {transform, width, height};

    const className = classNames({'is-printing': isPrinting, 'multi-page': multiPage});


    return h('div.figure-container-outer', {style: {paddingTop}, className}, [
      h('div.figure-container', {className, style: size}, [
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
