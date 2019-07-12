
import "@babel/polyfill"
import './style.styl'

import {FocusStyleManager} from '@blueprintjs/core'
import {Component} from 'react'
import {render} from 'react-dom'
import h from 'react-hyperscript'
import {UIControls} from './ui-controls'
import {FigureContainer} from './figure-container'
import {AppStateManager, AppStateContext} from './state-manager'
import {TaskList} from './task-list'

FocusStyleManager.onlyShowFocusOnTabs()

class AppMain extends Component
  @contextType: AppStateContext
  renderMain: ->
    {taskLists, selectedTask, zoomLevel} = @context
    console.log selectedTask
    if selectedTask?
      return h FigureContainer, {task: selectedTask, zoomLevel}
    if taskLists?
      return h TaskList, {runners: taskLists}
    return null

  render: ->
    h 'div#app-main', [
      h UIControls
      @renderMain()
    ]

App = ->
  h AppStateManager, null, h(AppMain)

el = document.querySelector("#app")
render(h(App),el)
