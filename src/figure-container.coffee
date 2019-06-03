import {Component} from 'react'
import {AppStateContext} from './state-manager'
import h from 'react-hyperscript'

class FigureContainer extends Component
  @contextType: AppStateContext
  constructor: (props)->
    super props
  render: ->
    h 'div#pdf-printer-figure-container-outer', null, [
      h 'div#pdf-printer-figure-container', null, "Hi"
    ]

export {FigureContainer}
