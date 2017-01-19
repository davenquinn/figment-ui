{register} = require 'electron-localshortcut'

module.exports = (win)->
  zoomShortcuts =
    '=': 'zoom-in'
    '-': 'zoom-out'
    '0': 'zoom-reset'

  register win, "CommandOrControl+-", =>
    win.webContents.send 'zoom-out'
  register win, "CommandOrControl+=", =>
    win.webContents.send 'zoom-in'
  register win, "CommandOrControl+0", =>
    win.webContents.send 'zoom-reset'
