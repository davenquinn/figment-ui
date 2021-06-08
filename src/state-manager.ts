import { Component, createContext } from "react"
import h from "~/hyper"
import update from "immutability-helper"
import { remote, ipcRenderer } from "electron"
import { spawn } from "child_process"
import { parse } from "path"
import "devtools-detect"
import { printFigureArea } from "./print"
import Figment from "./index"
import { DarkModeProvider } from "@macrostrat/ui-components/lib/cjs/dark-mode"

// For backwards compatibility
global.Printer = Figment

interface AppStateCtx {
  update: Function
  printFigureArea: Function
  hasTaskList: boolean
  nameForTask: string
  openEditor: Function
  selectTask: Function
  toggleDevTools: Function
  selectedTask: any
}

const AppStateContext = createContext<AppStateCtx>({})

const nameForTask = function (task) {
  let { name, outfile } = task
  if (name == null) {
    ;({ name } = parse(outfile))
  }
  return name.replace(/[-_]/g, " ")
}

interface State {
  selectedTaskHash: string | null
  devToolsEnabled: boolean
}

class _AppStateManager extends Component<{}, State> {
  constructor(props) {
    super(props)
    this.shouldListTasks = this.shouldListTasks.bind(this)
    this.selectedTask = this.selectedTask.bind(this)
    this.__createSpec = this.__createSpec.bind(this)
    this.__getSpecs = this.__getSpecs.bind(this)
    this.openEditor = this.openEditor.bind(this)
    this.selectTask = this.selectTask.bind(this)
    this.updateState = this.updateState.bind(this)
    this.toggleDevTools = this.toggleDevTools.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)

    const options = remote.getGlobal("options")
    const appState = remote.getGlobal("appState")

    this.state = {
      taskLists: null,
      // We should improve this
      isPrinting: false,
      error: null,
      ...options,
      ...appState,
    }

    this.defineTasks(options)
  }

  shouldListTasks() {
    const { taskLists } = this.state
    if (taskLists == null) {
      return false
    }
    if (taskLists.length === 1) {
      return taskLists[0].tasks.length !== 1
    }
    return true
  }

  selectedTask() {
    const { selectedTaskHash, taskLists } = this.state
    if (taskLists == null) {
      return null
    }
    if (!this.shouldListTasks()) {
      return taskLists[0].tasks[0]
    }

    for (let taskList of Array.from(taskLists)) {
      for (let task of Array.from(taskList.tasks)) {
        if (task.hash === selectedTaskHash) {
          return task
        }
      }
    }
    return null
  }

  __createSpec(options) {
    // These should really be applied separately to each part
    const { multiPage, pageSize } = this.state
    const spec = new Figment()
    spec.task(options.outfile, options.infile, { multiPage, pageSize })
    return [spec]
  }

  async __getSpecs(options) {
    const { specs } = options
    // If we are in spec mode
    if (specs == null) {
      return this.__createSpec(options)
    }
    let results = []
    for (const spec of specs) {
      try {
        // Require using ESM module
        const res = __non_webpack_require__(spec)
        res.name = spec
        results.push(res)
      } catch (err) {
        results.push(err)
      }
    }
    return results
  }

  async defineTasks(options) {
    try {
      let res = await this.__getSpecs(options)
      this.updateState({ taskLists: { $set: res } })
    } catch (error) {
      const err = error
      this.updateState({ error: { $set: err } })
    }
  }

  openEditor() {
    const task = this.selectedTask()
    if (task == null) {
      return
    }
    return spawn(process.env.EDITOR, [task.code], { detached: true })
  }

  selectTask(task) {
    console.log(`Selecting task ${task?.hash}`)
    return this.updateState({ selectedTaskHash: { $set: task?.hash } })
  }

  render() {
    const { selectedTaskHash, ...rest } = this.state
    console.log("Creating new context")

    const value = {
      update: this.updateState,
      printFigureArea: this.printFigureArea,
      hasTaskList: this.shouldListTasks(),
      nameForTask,
      openEditor: this.openEditor,
      selectTask: this.selectTask,
      toggleDevTools: this.toggleDevTools,
      ...rest,
      selectedTask: this.selectedTask(),
    }

    return h(AppStateContext.Provider, { value }, this.props.children)
  }

  updateState(spec) {
    const newState = update(this.state, spec)
    this.setState(newState)
    // forward state to main process
    const { devToolsEnabled, selectedTaskHash, toolbarEnabled, zoomLevel } =
      newState
    const appState = {
      devToolsEnabled,
      selectedTaskHash,
      toolbarEnabled,
      zoomLevel,
    }
    return ipcRenderer.send("update-state", appState)
  }

  toggleDevTools() {
    this.updateState({ devToolsEnabled: { $set: true } })
    ipcRenderer.send("dev-tools")
    const win = remote.getCurrentWindow()
    return win.openDevTools()
  }

  componentDidMount() {
    ipcRenderer.on("show-toolbar", (event, toolbarEnabled) => {
      return this.updateState({ toolbarEnabled: { $set: toolbarEnabled } })
    })

    ipcRenderer.on("zoom", (event, zoom) => {
      return this.updateState({ zoomLevel: { $set: zoom } })
    })

    ipcRenderer.on("update-state", (event, state) => {
      console.log("Updating state from main process")
      return this.setState({ ...state })
    })

    return window.addEventListener("devtoolschange", (event) => {
      const { isOpen } = event.detail
      return this.updateState({ devToolsEnabled: { $set: isOpen } })
    })
  }

  printFigureArea = async () => {
    const task = this.selectedTask()
    this.setState({ isPrinting: true })
    try {
      await printFigureArea(task)
    } catch (err) {
      console.error(err)
    }
    this.setState({ isPrinting: false })
  }
}

function AppStateManager(props) {
  return h(DarkModeProvider, {}, h(_AppStateManager, props))
}

export { AppStateContext, AppStateManager }
