{register} = require 'electron-localshortcut'
{ipcMain} = require 'electron'

global.zoom = 1
global.toolbar = true

module.exports = (win)->
  register win, "CommandOrControl+-", =>
    global.zoom /= 1.25
    win.webContents.send 'zoom', zoom
  register win, "CommandOrControl+=", =>
    global.zoom *= 1.25
    win.webContents.send 'zoom', zoom
  register win, "CommandOrControl+0", =>
    global.zoom = 1
    win.webContents.send 'zoom', zoom
  register win, "CommandOrControl+R", =>
    win.webContents.send 'reload'
  register win, "CommandOrControl+T", =>
    global.toolbar = not toolbar
    win.webContents.send 'show-toolbar', toolbar

