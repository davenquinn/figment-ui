import {Button} from '@blueprintjs/core'
import h from 'react-hyperscript'

UIControls = (props)->
  h 'div#pdf-printer-ui-controls', [
    h 'h1', 'Figure List'
    h 'div.buttons', [
      h Button, "Toggle DevTools"
      h Button, "Print"
      h Button, "Open Editor"
    ]
  ]


export {UIControls}
