import {Component, createContext} from 'react'
import h from 'react-hyperscript'
import update from 'immutability-helper'
import {remote, ipcRenderer} from 'electron'
import Promise from 'bluebird'
{spawn} = require 'child_process'
import {parse} from 'path'
import 'devtools-detect'

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

nameForTask = (task)->
  {name, outfile} = task
  if not name?
    {name} = parse(outfile)
  name.replace(/[-_]/g," ")

class AppStateManager extends Component
  constructor: (props)->
    super props
    options = remote.getGlobal 'options'
    appState = remote.getGlobal 'appState'

    @state = {
      taskLists: null
      # We should improve this
      isPrinting: false
      options...
      appState...
    }
    @defineTasks options

  shouldListTasks: =>
    {taskLists} = @state
    return false unless taskLists?
    if taskLists.length == 1
      return taskLists[0].tasks.length != 1
    return true

  selectedTask: =>
    {selectedTaskHash, taskLists} = @state
    return null unless taskLists?
    if not @shouldListTasks()
      return taskLists[0].tasks[0]

    for taskList in taskLists
      for task in taskList.tasks
        if task.hash == selectedTaskHash
          return task
    return null

  defineTasks: (options)=>
    {specs} = options
    # These should really be applied separately to each part
    {multiPage, pageSize} = @state
    # If we are in spec mode
    if specs?
      p = Promise.map specs, getSpecs
    else
      spec = new Printer()
      spec.task options.outfile, options.infile, {
        multiPage, pageSize
      }
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
      hasTaskList: @shouldListTasks(),
      nameForTask
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
      devToolsEnabled
      zoomLevel } = newState
    ipcRenderer.send 'update-state', appState

  toggleDevTools: =>
    @updateState {devToolsEnabled: {$set: true}}
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

    window.addEventListener 'devtoolschange', (event)=>
      {isOpen} = event.detail
      @updateState {devToolsEnabled: {$set: isOpen}}

  printFigureArea: =>
    task = @selectedTask()
    @updateState {isPrinting: {$set: true}}
    try
      await printFigureArea(task)
    catch err
      console.err err
    @updateState {isPrinting: {$set: false}}

export {AppStateContext, AppStateManager}
