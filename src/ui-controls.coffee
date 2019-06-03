import {Button} from '@blueprintjs/core'
import h from 'react-hyperscript'
import {Component} from 'react'
import {AppStateContext} from './state-manager'

class DevToolsButton extends Component
  @contextType: AppStateContext
  render: ->
    onClick = @context.toggleDevTools
    h Button, {onClick}, "DevTools"

UIControls = (props)->
  h 'div#pdf-printer-ui-controls', [
    h 'h1', 'Figure List'
    h 'div.buttons', [
      h DevToolsButton
      h Button, "Print"
      h Button, "Open Editor"
    ]
  ]


export {UIControls}
