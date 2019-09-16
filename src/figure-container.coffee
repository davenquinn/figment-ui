import h from '~/hyper'
import {Component} from 'react'
import T from 'prop-types'
import {TaskRenderer, TaskShape} from './task'
import {MarginType} from '~/types'
import classNames from 'classnames'
import {AppStateContext} from './state-manager'

class FigureContainer extends Component
  @contextType: AppStateContext
  @defaultProps: {
    zoomLevel: 1
    marginTop: 0
    scaleFactor: 1
  }
  @propTypes: {
    marginTop: MarginType
    multiPage: T.bool.isRequired
    scaleFactor: T.number
    width: T.number
  }
  render: ->
    {zoomLevel, task, marginTop,
     multiPage, scaleFactor, width} = @props
    {isPrinting} = @context
    # We shouldn't have this nested structure, it's confusing

    height = if multiPage then null else "100vh"

    z = if (zoomLevel == 1 or isPrinting) then null else "scale(#{zoomLevel})"
    style = {
      transform: z
      width
    }

    className = classNames {'is-printing': isPrinting}
    padding = 20
    if isPrinting
      padding = 0

    h 'div.figure-container-outer', {style: {height, paddingTop: marginTop}, className}, [
      h 'div.figure-container', {className, style: {padding, width: width+2*padding}}, [
        h 'div.figure-container-inner', {
          className
          style
        }, @props.children
      ]
    ]

export {FigureContainer}
