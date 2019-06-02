import {Button} from '@blueprintjs/core'
import h from 'react-hyperscript'

{remote, ipcRenderer, webFrame} = require 'electron'

DevToolsButton = ->
  onClick = ->
    ipcRenderer.send 'dev-tools'
    win = remote.getCurrentWindow()
    win.openDevTools()

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
