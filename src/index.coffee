
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
    {taskLists, selectedTask} = @context
    if selectedTask?
      return h FigureContainer, {task: selectedTask}
    if taskLists?
      return h TaskList, {runners: taskLists}
    return null

  renderControls: ->
    {selectedTask} = @context
    return null unless selectedTask?
    return h UIControls

  render: ->
    h 'div#app-main', [
      @renderControls()
      @renderMain()
    ]

App = ->
  h AppStateManager, null, h(AppMain)

el = document.querySelector("#app")
render(h(App),el)
