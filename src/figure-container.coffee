import h from '~/hyper'
import {Component} from 'react'
import T from 'prop-types'
import {TaskRenderer, TaskShape} from './task'

class FigureContainer extends Component
  @defaultProps: {
    zoomLevel: 1
  }
  @propTypes: {
    task: TaskShape
  }
  render: ->
    {zoomLevel, task} = @props
    # We shouldn't have this nested structure, it's confusing
    {multiPage} = task.opts
    multiPage ?= false

    height = if multiPage then null else "100vh"

    z = if zoomLevel == 1 then null else "scale(#{zoomLevel})"
    style = {
      transform: z
      transformOrigin: "0px 0px"
      padding: "#{20/zoomLevel}px"
    }

    h 'div.figure-container-outer', {style: {height}}, [
      h 'div.figure-container', {style}, [
        h TaskRenderer, {task, key: task}
      ]
    ]

export {FigureContainer}
