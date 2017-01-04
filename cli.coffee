# Headless mode for figure generation
path = require 'path'
fs = require 'fs'
min = require 'minimist'
Promise = require 'bluebird'
{BrowserWindow, app, ipcMain} = require 'electron'

argv = min process.argv.slice(2)
# Specify --debug to show BrowserWindow
#   and open devtools
debug = argv.debug?
# Option just to show browser window (primarily for
# debugging taskflow of this module)
show = argv.show or debug
# Set directory to reload if not given
if debug
  argv.reload ?= process.cwd()
  console.log "Reloading from directory #{argv.reload}"
  require('electron-reload')(argv.reload)

opts = {show: show}

# Create list of task-runner files to import
# Each argument should be a javascript or coffeescript
# file exporting a renderer object
dn = process.cwd()
global.specs = argv._.map (d)->path.join(dn,d)

createWindow = ->

  console.log if debug \
         then "Creating browser window" \
         else "Creating headless renderer"

  win = new BrowserWindow opts
  if debug
    url = "file://#{__dirname}/_testing/index.html"
  else
    url = "file://#{__dirname}/_headless/index.html"
  win.loadURL url

  ipcMain.on 'toggle-dev-tools', ->
    win.toggleDevTools()

  win.on 'closed', ->
    win = null

app.on 'ready', createWindow
app.on 'window-all-closed', -> app.quit()
