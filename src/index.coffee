import "@babel/polyfill"

import {Component} from 'react'
import {render} from 'react-dom'
import h from 'react-hyperscript'
import {UIControls} from './ui-controls'
import {AppStateManager, AppStateContext} from './state-manager'
import {TaskList} from './task-list'
import {TaskRenderer} from './task'
import {BundlerError} from './task/error'
import {FocusStyleManager} from '@blueprintjs/core'
FocusStyleManager.onlyShowFocusOnTabs()
import './main.styl'

class AppMain extends Component
  @contextType: AppStateContext
  renderMain: ->
    {taskLists, selectedTask, zoomLevel, toolbarEnabled, error} = @context
    marginTop = if toolbarEnabled then "38px" else null
    if error?
      return h BundlerError, {error}
    if selectedTask?
      return h TaskRenderer, {task: selectedTask, zoomLevel, marginTop}
    if taskLists?
      return h TaskList, {runners: taskLists}
    return null

  render: ->
    h 'div.app-main', [
      h UIControls
      @renderMain()
    ]

App = ->
  h AppStateManager, null, h(AppMain)

el = document.querySelector("#app")
render(h(App),el)
