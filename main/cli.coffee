# Headless mode for figure generation
path = require 'path'
fs = require 'fs'
min = require 'minimist'
Promise = require 'bluebird'
{BrowserWindow, app, ipcMain, protocol} = require 'electron'
shortcuts = require './shortcuts'
readline = require 'readline'

argv = min process.argv.slice(2), boolean: ['debug', 'spec-mode', 'show']
# Specify --debug to show BrowserWindow
#   and open devtools
# Specify --spec to load from a spec
debug = argv.debug
# Option just to show browser window (primarily for
# debugging taskflow of this module)
show = argv.show or debug
# Set directory to reload if not given

args = argv._
global.args = args
global.specMode = argv['spec-mode']

global.options = {
  # Wait between rendering items
  waitForUser: show
  dpi: parseFloat(argv.dpi) or 300.0
  debug: debug
  devToolsEnabled: false
  reload: argv.reload or argv.debug
}

if argv['spec-mode']
  # Create list of task-runner files to import
  # Each argument should be a javascript or coffeescript
  # file exporting a renderer object
  console.log argv
  console.log "Working in spec mode"
  options.specs = args.map (d)->path.resolve(d)
else
  [options.infile, options.outfile] = args

### Setup IPC ###

rl = readline.createInterface
  input: process.stdin,
  output: process.stdout

createWindow = ->

  cb = (request, callback) =>
    url = request.url.substr(6)
    pth = path.normalize("#{process.cwd()}/#{url}")
    console.log pth
    callback({path:pth})

  protocol.registerFileProtocol 'app', cb, (error)->
    return unless error
    console.error('Failed to register protocol')

  console.log if debug \
         then "Creating browser window" \
         else "Creating headless renderer"

  win = new BrowserWindow {show: show}
  parentDir = path.resolve(path.join(__dirname,'..'))
  url = "file://"+path.join(parentDir,'_window', 'index.html')
  win.loadURL url
  shortcuts(win)
  ipcMain.on 'dev-tools', (event)->
    options.devToolsEnabled = !options.devToolsEnabled
    console.log options.devToolsEnabled

  ipcMain.on 'wait-for-input', (event)->
    rl.question 'Press enter to continue', (ans)->
      event.sender.send('done-waiting')

  win.on 'closed', ->
    win = null

quitApp = ->
  console.log "Received signal to terminate"
  app.quit()

app.on 'ready', createWindow
app.on 'window-all-closed', quitApp

process.on 'SIGINT', quitApp
process.on 'SIGTERM', quitApp
process.on 'SIGHUP', quitApp
