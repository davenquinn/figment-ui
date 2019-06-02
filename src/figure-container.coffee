import {Component} from 'react'
import {AppStateContext} from './state-manager'
import h from 'react-hyperscript'

class FigureContainer extends Component
  @contextType: AppStateContext

  render: ->

    console.log @context

    h 'div#pdf-printer-figure-container-outer', [
      h 'div#pdf-printer-figure-container', null, "Hi"
    ]

export {FigureContainer}
