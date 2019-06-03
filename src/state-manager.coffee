import {Component, createContext} from 'react'
import h from 'react-hyperscript'
import update from 'immutability-helper'
import {remote, ipcRenderer} from 'electron'

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
    {toggleDevTools} = @
    value = {update: @updateState, toggleDevTools, @state...}
    h AppStateContext.Provider, {value}, @props.children

  updateState: (spec)=>
    @setState update(@state,spec)

  toggleDevTools: =>
    ipcRenderer.send 'dev-tools'
    win = remote.getCurrentWindow()
    win.openDevTools()

  componentDidMount: =>
    ipcRenderer.on 'show-toolbar', (event, toolbarEnabled)=>
      console.log toolbarEnabled
      @updateState {toolbarEnabled: {$set: toolbarEnabled}}



export {AppStateContext, AppStateManager}
