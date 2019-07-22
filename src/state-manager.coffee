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

class AppStateManager extends Component
  constructor: (props)->
    super props
    options = remote.getGlobal 'options'
    appState = remote.getGlobal 'appState'

    @state = {
      taskLists: null
      # We should improve this
      options...
      appState...
    }

    @defineTasks options

  selectedTask: =>
    {selectedTaskHash, taskLists} = @state
    return null unless taskLists?
    for taskList in taskLists
      for task in taskList.tasks
        if task.hash == selectedTaskHash
          return task
    return null

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
    task = @selectedTask()
    return unless task?
    spawn process.env.EDITOR, [task.code], {detached: true}

  selectTask: (task)=>
    hash = null
    if task?
      hash = task.hash
    @updateState {selectedTaskHash: {$set: hash}}

  render: ->
    methods = do => {toggleDevTools, openEditor, selectTask} = @
    selectedTask = @selectedTask()
    value = {
      update: @updateState,
      printFigureArea: @printFigureArea,
      methods...
      @state...
      selectedTask
    }

    h AppStateContext.Provider, {value}, @props.children

  updateState: (spec)=>
    newState = update(@state,spec)
    @setState newState
    # forward state to main process
    appState = do -> {
      toolbarEnabled,
      selectedTaskHash,
      zoomLevel } = newState
    ipcRenderer.send 'update-state', appState

  toggleDevTools: =>
    ipcRenderer.send 'dev-tools'
    win = remote.getCurrentWindow()
    win.openDevTools()

  componentDidMount: =>
    ipcRenderer.on 'show-toolbar', (event, toolbarEnabled)=>
      @updateState {toolbarEnabled: {$set: toolbarEnabled}}

    ipcRenderer.on 'zoom', (event, zoom)=>
      @updateState {zoomLevel: {$set: zoom}}

    ipcRenderer.on 'update-state', (event, state)=>
      console.log "Updating state from main process"
      @setState {state...}

  printFigureArea: =>
    task = @selectedTask()
    printFigureArea(task)


export {AppStateContext, AppStateManager}
