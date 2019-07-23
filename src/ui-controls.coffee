import {AnchorButton, Button} from '@blueprintjs/core'
import h from '@macrostrat/hyper'
import {Component, useContext} from 'react'
import {AppStateContext} from './state-manager'
import {TaskListItem} from './task-list'

ToolButton = (props)->
  h Button, {small: true, props...}

class DevToolsButton extends Component
  @contextType: AppStateContext
  render: ->
    onClick = @context.toggleDevTools
    h ToolButton, {onClick}, "DevTools"

class BackButton extends Component
  @contextType: AppStateContext
  render: ->
    return null unless @context.selectedTask?
    return null unless @context.hasTaskList
    onClick = => @context.selectTask null
    h ToolButton, {icon: 'caret-left', onClick}, 'Back to list'

class PrintButton extends Component
  @contextType: AppStateContext
  render: ->
    {printFigureArea} = @context
    onClick = ->
      printFigureArea()
    h ToolButton, {icon: 'print', onClick}, 'Print'

class EditorButton extends Component
  @contextType: AppStateContext
  render: ->
    h ToolButton, {
      icon: 'edit',
      onClick: @context.openEditor
    }, 'Open editor'

CurrentTaskName = (props)->
  {selectedTask, nameForTask} = useContext(AppStateContext)
  return null unless selectedTask?
  h 'h1.task-name', nameForTask(selectedTask)


class UIControls extends Component
  @contextType: AppStateContext
  render: ->
    {hasTaskList, selectedTask} = @context
    h 'div#pdf-printer-ui-controls', [
      h 'div.left-buttons', [
        h BackButton
        h CurrentTaskName
      ]
      h 'div.right-buttons', [
        h DevToolsButton
        h.if(selectedTask?), [
          h PrintButton
          h EditorButton
        ]
      ]
    ]

export {UIControls}
