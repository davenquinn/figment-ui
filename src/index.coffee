
import "@babel/polyfill"
import './style.styl'

import {FocusStyleManager} from '@blueprintjs/core'
import {Component} from 'react'
import {render} from 'react-dom'
import h from 'react-hyperscript'
import {UIControls} from './ui-controls'
import {FigureContainer} from './figure-container'
import {AppStateManager} from './state-manager'

FocusStyleManager.onlyShowFocusOnTabs()

class TaskList extends Component
  render: ->
    h 'div.task-list'

App = ->
  h AppStateManager, null, (
    h 'div#app-main', [
      h UIControls,
      h FigureContainer
    ]
  )

el = document.querySelector("#app")
render(h(App),el)
