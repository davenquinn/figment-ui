import "@babel/polyfill"
import { FocusStyleManager } from "@blueprintjs/core"
FocusStyleManager.onlyShowFocusOnTabs()

import { Component, useContext } from "react"
import { render } from "react-dom"
import h from "~/hyper"
import { UIControls } from "./ui-controls"
import { AppStateManager, AppStateContext } from "./state-manager"
import { TaskList } from "./task-list"
import { TaskRenderer } from "./task"
import { BundlerError } from "./task/error"
import classNames from "classnames"
import "./main.styl"

const NoTaskError = () =>
  h("div.error-overlay.no-task", [
    h("div.bp3-ui-text.entry", [
      h("h1", "Figment"),
      h("h2", "No task defined"),
      h("div.usage", [
        h("h3", "Usage"),
        h("div.scripts", [
          h("pre.bp3-code-block", "figment entry.js figure.pdf"),
          h("pre.bp3-code-block", "figment --spec spec1.js [...]"),
        ]),
      ]),
    ]),
  ])

function TaskBody() {
  const { taskLists, selectedTask, zoomLevel, toolbarEnabled, error } =
    useContext(AppStateContext)
  const marginTop = toolbarEnabled ? "38px" : null
  if (error != null) {
    return h(BundlerError, { error })
  }
  if (selectedTask != null) {
    return h(TaskRenderer, { task: selectedTask, zoomLevel, marginTop })
  }
  if (taskLists != null) {
    return h(TaskList, { runners: taskLists })
  }
  return h(NoTaskError)
}

function AppMain() {
  const { toolbarEnabled, isPrinting } = useContext(AppStateContext)
  const className = classNames({
    "toolbar-disabled": !toolbarEnabled,
    "is-printing": isPrinting,
  })
  return h("div.app-main", { className }, [h(UIControls), h(TaskBody)])
}

const App = () => h(AppStateManager, null, h(AppMain))

let el = document.createElement("div")
el.id = "app"
document.body.appendChild(el)

//const el = document.querySelector("#app");
render(h(App), el)
