
import "@babel/polyfill"
import './style.styl'

import {FocusStyleManager} from '@blueprintjs/core'
import {render} from 'react-dom'
import h from 'react-hyperscript'
import {UIControls} from './ui-controls'
import {FigureContainer} from './figure-container'
import {AppStateManager} from './state-manager'

FocusStyleManager.onlyShowFocusOnTabs()

App = ->
  h AppStateManager, null, (
    h 'div#app-main', [
      h UIControls,
      h FigureContainer
    ]
  )

el = document.querySelector("#app")
render(h(App),el)
