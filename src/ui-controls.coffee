import {AnchorButton, Button} from '@blueprintjs/core'
import h from 'react-hyperscript'
import {Component} from 'react'
import {AppStateContext} from './state-manager'

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

class UIControls extends Component
  @contextType: AppStateContext
  renderTaskButtons: ->
    {selectedTask} = @context
    return null unless selectedTask?
    h [
      h PrintButton
      h EditorButton
    ]

  render: ->
    h 'div#pdf-printer-ui-controls', [
      h 'div.left-buttons', [
        h BackButton
      ]
      h 'div.right-buttons', [
        h DevToolsButton
        @renderTaskButtons()
      ]
    ]

export {UIControls}
