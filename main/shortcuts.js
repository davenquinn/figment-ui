const { register } = require("electron-localshortcut")
const { ipcMain } = require("electron")

global.zoom = 1
global.toolbar = false

module.exports = (win) => {
  const setState = (args) => {
    global.appState = {
      ...appState,
      ...args,
    }
    win.webContents.send("update-state", global.appState)
  }

  win.webContents.send("show-toolbar", global.toolbar)

  register(win, "CommandOrControl+-", () => {
    zoomLevel = appState.zoomLevel / 1.25
    setState({ zoomLevel })
  })

  register(win, "CommandOrControl+=", () => {
    zoomLevel = appState.zoomLevel * 1.25
    setState({ zoomLevel })
  })

  register(win, "CommandOrControl+0", () => {
    setState({ zoomLevel: 1 })
  })

  //register(win, "CommandOrControl+R", ()=>{
  //win.webContents.send('reload');
  //});

  register(win, "CommandOrControl+T", () => {
    setState({ toolbarEnabled: !appState.toolbarEnabled })
  })
}
