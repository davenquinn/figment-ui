import {Component, createContext} from 'react'
import h from 'react-hyperscript'
import update from 'immutability-helper'
import {remote, ipcRenderer} from 'electron'
import Promise from 'bluebird'
{spawn} = require 'child_process'

# This is awful
import {Printer, printFigureArea} from "./lib.coffee"
window.Printer = Printer

AppStateContext = createContext {}

getSpecs = (d)->
  res = require(d)
  Promise.resolve res
    .then (v)->
      v.name = d
      v

openEditor = (d)->
  spawn process.EDITOR, [d.code], detached: true


class AppStateManager extends Component
  constructor: (props)->
    super props
    options = remote.getGlobal 'options'

    @state = {
      toolbarEnabled: true
      taskLists: null
      selectedTask: null
      # We should improve this
      zoomLevel: remote.getGlobal('zoom')
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

  openEditor: =>
    {selectedTask: task} = @state
    return unless task?
    console.log task
    spawn process.env.EDITOR, [task.code], {detached: true}

  render: ->
    {toggleDevTools, openEditor} = @
    value = {
      update: @updateState,
      printFigureArea,
      toggleDevTools,
      openEditor,
      @state...
    }
    h AppStateContext.Provider, {value}, @props.children

  updateState: (spec)=>
    @setState update(@state,spec)

  toggleDevTools: =>
    ipcRenderer.send 'dev-tools'
    win = remote.getCurrentWindow()
    win.openDevTools()

  componentDidMount: =>
    ipcRenderer.on 'show-toolbar', (event, toolbarEnabled)=>
      @updateState {toolbarEnabled: {$set: toolbarEnabled}}

    ipcRenderer.on 'zoom', (event, zoom)=>
      @updateState {zoomLevel: {$set: zoom}}


export {AppStateContext, AppStateManager}
