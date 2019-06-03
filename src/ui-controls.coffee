import {AnchorButton, Button} from '@blueprintjs/core'
import h from 'react-hyperscript'
import {Component} from 'react'
import {AppStateContext} from './state-manager'

class DevToolsButton extends Component
  @contextType: AppStateContext
  render: ->
    onClick = @context.toggleDevTools
    h Button, {onClick}, "DevTools"

class BackButton extends Component
  @contextType: AppStateContext
  render: ->
    {update} = @context
    onClick = ->
      update {selectedTask: {$set: null}}
    h Button, {icon: 'caret-left', onClick}, 'Back to list'

class UIControls extends Component
  render: ->
    h 'div#pdf-printer-ui-controls', [
      h BackButton
      h 'div.buttons', [
        h DevToolsButton
        h Button, "Print"
        h Button, "Open Editor"
      ]
    ]

export {UIControls}
