
import "@babel/polyfill"
import './style.styl'

import {FocusStyleManager} from '@blueprintjs/core'
import {render} from 'react-dom'
import h from 'react-hyperscript'
import React from 'react'
import {remote} from 'electron'
import {UIControls} from './ui-controls'

FocusStyleManager.onlyShowFocusOnTabs()

FigureContainer = (props)->
  h 'div#pdf-printer-figure-container-outer', [
    h 'div#pdf-printer-figure-container'
  ]

class App extends React.Component
  constructor: (props)->
    options = remote.getGlobal 'options'
    super props
    @state = {
      showToolbar: true
      options...
    }
  render: ->
    h 'div#app-main', [
      h UIControls,
      h FigureContainer
    ]

el = document.querySelector("#app")
render(h(App),el)
