require "@babel/polyfill"
require './style.styl'

{render} = require 'react-dom'
h = require 'react-hyperscript'
React = require 'react'

el = document.querySelector("#app")

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

class App extends Component
  render: ->
    h 'div#app-main', [
      h UIControls,
      h FigureContainer
    ]


render(h(App),el)
