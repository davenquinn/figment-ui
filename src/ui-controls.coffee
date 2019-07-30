import {AnchorButton, Button, Intent} from '@blueprintjs/core'
import {Component, useContext} from 'react'
import {AppStateContext} from './state-manager'
import {TaskListItem} from './task-list'
import h from '~/hyper'

ToolButton = (props)->
  h Button, {small: true, minimal: true, props...}

class DevToolsButton extends Component
  @contextType: AppStateContext
  render: ->
    onClick = @context.toggleDevTools
    disabled = @context.devToolsEnabled
    h ToolButton, {onClick, disabled, rightIcon: 'code'}, "DevTools"

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
    h ToolButton, {rightIcon: 'print', onClick, intent: Intent.SUCCESS}, 'Print'

class ReloadButton extends Component
  @contextType: AppStateContext
  render: ->
    onClick = => #@context.reload null
    h ToolButton, {rightIcon: 'repeat', onClick, intent: Intent.PRIMARY}, 'Reload'


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
  h 'h1.task-name.bp3-text', nameForTask(selectedTask)


ToolbarToggleButton = (props)->
  {update, toolbarEnabled} = useContext(AppStateContext)
  onClick = -> update {$toggle: ['toolbarEnabled']}
  intent = null
  icon = 'menu'
  if toolbarEnabled
    icon = 'eye-off'
  h ToolButton, {
    minimal: true, icon, intent, onClick,
    className: 'toolbar-toggle-button',
    props...
  }

MinimalUIControls = ->
  h 'div.ui-controls-hidden', [
    h ToolbarToggleButton, {small: false}
  ]

class UIControls extends Component
  @contextType: AppStateContext
  render: ->
    {hasTaskList, selectedTask, toolbarEnabled} = @context
    if not toolbarEnabled
      return h MinimalUIControls

    h 'div.ui-controls', [
      h 'div.left-buttons', [
        h BackButton
        h CurrentTaskName
      ]
      h 'div.right-buttons', [
        h DevToolsButton
        h.if(selectedTask?) [
          #h ReloadButton
          h PrintButton
        ]
        h 'span.separator'
        h ToolbarToggleButton
      ]
    ]

export {UIControls}
