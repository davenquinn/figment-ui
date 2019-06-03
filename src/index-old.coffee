{remote, ipcRenderer, webFrame} = require 'electron'
path = require 'path'
Promise = require 'bluebird'
d3 = require 'd3-selection'
{spawn} = require 'child_process'
{runTask} = require './task'
{Printer, printFigureArea} = require("./lib.coffee")
window.Printer = Printer

options = remote.getGlobal 'options'

# # Print logging statements to both webtools and to command line
# c1 = remote.getGlobal('console')
# for i in ['log', 'warn', 'error']
#   oldFunc = console[i]
#   console[i] = ->
#     oldFunc.apply(arguments)
#     c1[i].apply(arguments)

process.exit = remote.app.quit

# redirect errors to stderr
window.addEventListener 'error', (e) ->
  e.preventDefault()
  console.error e.error.stack or 'Uncaught ' + e.error

createMainPage = null
isMainPage = null
tasks = []

body = d3.select 'body'

zoomContainer = d3.select '#pdf-printer-figure-zoom-container'
main = d3.select '#pdf-printer-figure-container'
currentTask = null

reloadWebview = ->
  wc = remote.getCurrentWebContents()
  wc.reloadIgnoringCache()
  webFrame.setZoomLevel(1)
  console.log "Reloading..."

controls = d3.select "#pdf-printer-ui-controls"

title = d3.select '#pdf-printer-ui-controls>h1'

setZoomFactor = (zoom)->
  webFrame.setZoomLevel(1)
  z = if zoom == 1 then null else "scale(#{zoom})"
  main
    .style('transform', z)
    .style('transform-origin', "0px 0px")
    .style('padding', "#{20/zoom}px")

ipcRenderer.on 'zoom', (event, zoom)->
  setZoomFactor(zoom)

ipcRenderer.on 'reload', reloadWebview

sharedStart = (array) ->
  # From
  # http://stackoverflow.com/questions/1916218/
  #       find-the-longest-common-starting-substring-in-a-set-of-strings
  A = array.concat().sort()
  a1 = A[0]
  a2 = A[A.length - 1]
  L = a1.length
  i = 0
  while i < L and a1.charAt(i) == a2.charAt(i)
    i++
  a1.substring 0, i

openEditor = (d)->
  spawn process.EDITOR, [d.code], detached: true

itemSelected = (d)->
  ### Run a single task ###
  console.log "Running task"

  location.hash = "##{d.hash}"

  t = title.html ""
  if tasks.length > 1
    t.append 'a'
      .attr 'href','#'
      .text '◀︎ Back to list'
      .on 'click', loadEntryPoint(createMainPage)
  else
    t.text "PDF Printer"

  ### set current task ###
  d3.select '#print'
    .on 'click', ->
      console.log "Printing figure"
      printFigureArea d

  d3.select '#open-editor'
    .on 'click', ->
      return unless webview?
      console.log "Opening editor"
      openEditor d

  d3.selectAll("style").remove()
  main.html ""

  {devToolsEnabled, reload} = remote.getGlobal 'options'

  win = require('electron').remote.getCurrentWindow()
  if devToolsEnabled
    win.openDevTools()

  vals = do -> {code, helpers} = d
  console.log "Ready to run task"
  runTask null, vals, ->
    console.log "Finished rendering"

renderSpecList = (d)->

  console.log "Spec list"
  # Render spec list from runner
  el = d3.select @
    .attr "class", "task-list"
  # Find shared starting substring
  arr = d.tasks.map (d)->d.outfile
  arr.push d.name

  prefix = sharedStart(arr)

  el.append 'h5'
    .text prefix

  el.append 'h2'
    .text d.name.slice(prefix.length)

  sel = el
    .append 'ul'
    .selectAll 'li'
    .data d.tasks

  sel.enter()
    .append 'li'
    .append 'a'
      .attr 'href',(d)->"##{d.hash}"
      .text (d)->d.outfile.slice(prefix.length)
      .on 'click', itemSelected

createMainPage = (runners)->
  controls.style "display", "none"
  # Create a list of tasks

  main = d3.select "#pdf-printer-figure-container"
  main.html ""
  sel = main.selectAll 'div'
        .data runners

  sel.enter()
    .append 'div'
    .attr 'class', 'runner'
    .each renderSpecList

runBasedOnHash = (runners)->
  z = remote.getGlobal('zoom')
  setZoomFactor z

  _ = runners.map (d)->d.tasks
  tasks = Array::concat.apply [], _

  # We've only got one possibility,
  # so we don't need hashes!
  # We could probably represent this much more cleanly
  if tasks.length == 1
    console.log "Rendering single task"
    itemSelected tasks[0]
    return

  if location.hash.length > 1
    console.log "Attempting to navigate to #{location.hash}"
    # Check if we can grab a dataset
    for item in tasks
      if item.hash == location.hash.slice(1)
        itemSelected item
        return

  # If no hash then create main page
  createMainPage(runners)


loadEntryPoint = (fn)-> ->
  console.log "Loading entry point #{fn}"

  # If we are in spec mode
  if options.specs?
    p = Promise.map options.specs, getSpecs
  else
    spec = new Printer
    spec.task options.outfile, options.infile
    p = Promise.resolve [spec]
  p.then fn

runTaskA = (spec)->
  ## Runner for all tasks
  console.log "Running tasks from #{spec}"
  taskRunner = require spec
  Promise.resolve taskRunner
    .then (t)->t.run()

if options.debug
  fn = loadEntryPoint(runBasedOnHash)
  fn()
else
  # Run single tasks
  if options.specs?
    console.log "Running from spec"
    p = Promise.map options.specs, runTask, concurrency: 1
  else
    taskRunner = new Printer
    taskRunner.task options.outfile, options.infile
    p = taskRunner.run()
  p.then ->
    console.log "Done!"
    remote.app.quit()
