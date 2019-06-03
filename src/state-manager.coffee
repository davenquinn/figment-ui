import {Component, createContext} from 'react'
import h from 'react-hyperscript'
import update from 'immutability-helper'
import {remote, ipcRenderer} from 'electron'
import Promise from 'bluebird'

# This is awful
import {Printer} from "./lib.coffee"
window.Printer = Printer

AppStateContext = createContext {}

getSpecs = (d)->
  res = require(d)
  Promise.resolve res
    .then (v)->
      v.name = d
      v

class AppStateManager extends Component
  constructor: (props)->
    super props
    options = remote.getGlobal 'options'

    @state = {
      toolbarEnabled: true
      selectedTask: null
      zoomFactor: 1
      taskLists: []
      options...
    }

    @defineTasks options

  defineTasks: (options)=>
    # If we are in spec mode
    if options.specs?
      p = Promise.map options.specs, getSpecs
    else
      spec = new Printer
      spec.task options.outfile, options.infile
      p = Promise.resolve [spec]
    res = await p
    @updateState {taskLists: {$set: res}}

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
