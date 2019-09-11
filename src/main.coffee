import "@babel/polyfill"
import {FocusStyleManager} from '@blueprintjs/core'
FocusStyleManager.onlyShowFocusOnTabs()

import {Component} from 'react'
import {render} from 'react-dom'
import h from '~/hyper'
import {UIControls} from './ui-controls'
import {AppStateManager, AppStateContext} from './state-manager'
import {TaskList} from './task-list'
import {TaskRenderer} from './task'
import {BundlerError} from './task/error'
import {NonIdealState, Intent} from '@blueprintjs/core'
import {AppToaster} from './toaster'
import './main.styl'

NoTaskError = ->
  h 'div.error-overlay.no-task', [
    h 'div.bp3-ui-text.entry', [
      h "h1", "Vizzy"
      h "h2", "No task defined"
      h 'div.usage', [
        h "h3", "Usage"
        h "div.scripts", [
          h "pre.bp3-code-block", "vizzy entry.js figure.pdf"
          h "pre.bp3-code-block", "vizzy --spec spec1.js [...]"
        ]
      ]
    ]
  ]

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
    return h NoTaskError

  render: ->
    h 'div.app-main', [
      h UIControls
      @renderMain()
    ]

App = ->
  h AppStateManager, null, h(AppMain)

el = document.querySelector("#app")
render(h(App),el)
