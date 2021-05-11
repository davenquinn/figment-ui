import { Button, Intent } from "@blueprintjs/core"
import { Component, useContext } from "react"
import { AppStateContext } from "./state-manager"
import h from "~/hyper"
import classNames from "classnames"

const ToolButton = (props) =>
  h(Button, { small: true, minimal: true, ...props })

function DevToolsButton() {
  const ctx = useContext(AppStateContext)
  const onClick = ctx.toggleDevTools
  const disabled = ctx.devToolsEnabled
  return h(ToolButton, { onClick, disabled, rightIcon: "code" }, "DevTools")
}

function BackButton() {
  const ctx = useContext(AppStateContext)
  if (ctx.selectedTask == null && ctx.hasTaskList) {
    return null
  }
  const onClick = () => ctx.selectTask(null)
  return h(ToolButton, { icon: "caret-left", onClick }, "Back to list")
}

class PrintButton extends Component {
  static initClass() {
    this.contextType = AppStateContext
  }
  render() {
    const { printFigureArea } = this.context
    const onClick = () => printFigureArea()
    return h(
      ToolButton,
      { rightIcon: "print", onClick, intent: Intent.SUCCESS },
      "Print"
    )
  }
}
PrintButton.initClass()

class ReloadButton extends Component {
  static initClass() {
    this.contextType = AppStateContext
  }
  render() {
    const onClick = () => {} //@context.reload null
    return h(
      ToolButton,
      { rightIcon: "repeat", onClick, intent: Intent.PRIMARY },
      "Reload"
    )
  }
}
ReloadButton.initClass()

class EditorButton extends Component {
  static initClass() {
    this.contextType = AppStateContext
  }
  render() {
    return h(
      ToolButton,
      {
        icon: "edit",
        onClick: this.context.openEditor,
      },
      "Open editor"
    )
  }
}
EditorButton.initClass()

const AppTitle = () => h("h1.bp3-text", "Figment")

const CurrentTaskName = function (props) {
  const { selectedTask, nameForTask } = useContext(AppStateContext)
  if (selectedTask == null) {
    return h(AppTitle)
  }
  return h("h1.task-name.bp3-text", nameForTask(selectedTask))
}

const ToolbarToggleButton = function (props) {
  const { update, toolbarEnabled } = useContext(AppStateContext)
  const onClick = () => update({ $toggle: ["toolbarEnabled"] })
  const intent = null
  let icon = "menu"
  if (toolbarEnabled) {
    icon = "eye-off"
  }
  return h(ToolButton, {
    minimal: true,
    icon,
    intent,
    onClick,
    className: "toolbar-toggle-button",
    ...props,
  })
}

const MinimalUIControls = () =>
  h("div.ui-controls-hidden", [h(ToolbarToggleButton, { small: false })])

class UIControls extends Component {
  static initClass() {
    this.contextType = AppStateContext
  }
  render() {
    const { hasTaskList, selectedTask, toolbarEnabled } = this.context
    if (!toolbarEnabled) {
      return h(MinimalUIControls)
    }

    const fullscreen = window.screenY === 0 && window.screenTop === 0
    const className = classNames({ fullscreen })

    return h("div.ui-controls", { className }, [
      h("div.left-buttons", [h(BackButton), h(CurrentTaskName)]),
      h("div.right-buttons", [
        h(DevToolsButton),
        h.if(selectedTask != null)([
          //h ReloadButton
          h(PrintButton),
        ]),
        h("span.separator"),
        h(ToolbarToggleButton),
      ]),
    ])
  }
}
UIControls.initClass()

export { UIControls }
