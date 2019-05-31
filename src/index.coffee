
import "@babel/polyfill"
import './style.styl'

import {render} from 'react-dom'
import h from 'react-hyperscript'
import React from 'react'

UIControls = (props)->
  h 'div.pdf-printer-ui-controls', [
    h 'h1', 'Figure Lists'
    h 'div.buttons', [
      h 'a#toggle-dev-tools', "Toggle DevTools"
      h 'a#print', "Print"
      h 'a#open-editor', "Open Editor"
    ]
  ]

FigureContainer = (props)->
  h 'div.pdf-printer-figure-container-outer', [
    h 'div.pdf-printer-figure-container'
  ]

class App extends React.Component
  render: ->
    h 'div#app-main', [
      h UIControls,
      h FigureContainer
    ]

el = document.querySelector("#app")
render(h(App),el)
