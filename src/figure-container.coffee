import {Component} from 'react'
import h from 'react-hyperscript'

import {TaskRenderer} from './task'

class FigureContainer extends Component
  @defaultProps: {
    zoomLevel: 1
  }
  render: ->
    {zoomLevel, task} = @props

    z = if zoomLevel == 1 then null else "scale(#{zoomLevel})"
    style = {
      transform: z
      transformOrigin: "0px 0px"
      padding: "#{20/zoomLevel}px"
    }

    h 'div#pdf-printer-figure-container-outer', null, [
      h 'div#pdf-printer-figure-container', {style}, [
        h TaskRenderer, {task}
      ]
    ]

export {FigureContainer}
