{register} = require 'electron-localshortcut'
{ipcMain} = require 'electron'

global.zoom = 1

module.exports = (win)->
  zoomShortcuts =
    '=': 'zoom-in'
    '-': 'zoom-out'
    '0': 'zoom-reset'

  register win, "CommandOrControl+-", =>
    global.zoom /= 1.25
    win.webContents.send 'zoom', zoom
  register win, "CommandOrControl+=", =>
    global.zoom *= 1.25
    win.webContents.send 'zoom', zoom
  register win, "CommandOrControl+0", =>
    global.zoom = 1
    win.webContents.send 'zoom', zoom
