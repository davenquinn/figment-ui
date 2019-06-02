import {Component, createContext} from 'react'
import h from 'react-hyperscript'
import update from 'immutability-helper'
import {remote} from 'electron'

AppStateContext = createContext {}

class AppStateManager extends Component
  constructor: (props)->
    super props
    options = remote.getGlobal 'options'

    @state = {
      toolbarEnabled: true
      zoomFactor: 1
      options...
    }

  render: ->
    value = {update: @updateState, @state...}
    h AppStateContext.Provider, {value}, @props.children

  updateState: (spec)=>
    @setState update(@state,spec)

export {AppStateContext, AppStateManager}
