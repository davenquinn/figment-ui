import h from '~/hyper'
import {Component} from 'react'
import T from 'prop-types'
import {TaskRenderer, TaskShape} from './task'
import {MarginType} from '~/types'

class FigureContainer extends Component
  @defaultProps: {
    zoomLevel: 1
    marginTop: 0
  }
  @propTypes: {
    marginTop: MarginType
    multiPage: T.bool.isRequired
  }
  render: ->
    {zoomLevel, task, marginTop, multiPage} = @props
    # We shouldn't have this nested structure, it's confusing

    height = if multiPage then null else "100vh"

    z = if zoomLevel == 1 then null else "scale(#{zoomLevel})"
    style = {
      transform: z
      transformOrigin: "0px 0px"
      padding: "#{20/zoomLevel}px"
    }

    h 'div.figure-container-outer', {style: {height, paddingTop: marginTop}}, [
      h 'div.figure-container', {style}, [
        h 'div.figure-container-inner', null, @props.children
      ]
    ]

export {FigureContainer}
