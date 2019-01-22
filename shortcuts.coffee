{register} = require 'electron-localshortcut'
{ipcMain} = require 'electron'

global.zoom = 1
global.toolbar = false

module.exports = (win)->
  win.webContents.send 'show-toolbar', global.toolbar
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
    global.toolbar = not global.toolbar
    win.webContents.send 'show-toolbar', global.toolbar

