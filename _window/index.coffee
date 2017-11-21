{remote, ipcRenderer} = require 'electron'
path = require 'path'
Promise = require 'bluebird'
d3 = require 'd3-selection'
{watch} = require 'chokidar'
{spawn} = require 'child_process'

{Printer, printFigureArea} = require("./lib.coffee")
window.Printer = Printer

options = remote.getGlobal 'options'

c = remote.getGlobal('console')
console.log = c.log
console.error = c.error
console.warn = c.warn
process.exit = remote.app.quit

# redirect errors to stderr
window.addEventListener 'error', (e) ->
  e.preventDefault()
  console.error e.error.stack or 'Uncaught ' + e.error

createMainPage = null
isMainPage = null
tasks = []

body = d3.select 'body'
main = d3.select('#main')
webview = null
currentTask = null

reloadWebview = ->
  if not webview?
    wc = remote.getCurrentWebContents()
    wc.reloadIgnoringCache()
  else
    webview.reloadIgnoringCache()
  console.log "Reloading..."

controls = d3.select "#controls"

title = d3.select '#controls>h1'
d3.select '#toggle-dev-tools'
  .on 'click', ->
    ipcRenderer.send 'dev-tools'
    document
      .querySelector 'webview'
      .openDevTools()

ipcRenderer.on 'show-toolbar', (event, toolbarEnabled)->
  mode = if toolbarEnabled then 'flex' else 'none'
  controls.style 'display', mode

ipcRenderer.on 'zoom', (event, zoom)->
  return unless webview?
  webview.setZoomFactor zoom

ipcRenderer.on 'reload', reloadWebview

sharedStart = (array) ->
  # From
  # http://stackoverflow.com/questions/1916218/find-the-longest-common-starting-substring-in-a-set-of-strings
  A = array.concat().sort()
  a1 = A[0]
  a2 = A[A.length - 1]
  L = a1.length
  i = 0
  while i < L and a1.charAt(i) == a2.charAt(i)
    i++
  a1.substring 0, i

openEditor = (d)->
  spawn "mvim", [d.code], detached: true

itemSelected = (d)->
  ### Run a single task ###
  console.log "Running task"
  console.log d
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
      return unless webview?
      console.log "Printing figure"
      printFigureArea d

  d3.select '#open-editor'
    .on 'click', ->
      return unless webview?
      console.log "Opening editor"
      openEditor d

  main.html ""
  ## Set up a webview
  webview = main.append "webview"
    .attr "nodeintegration", true
    .attr "src", "file://"+require.resolve("../_runner/index-testing.html")
    .node()

  {devToolsEnabled, reload} = remote.getGlobal 'options'

  ## Setup reload handler
  if reload
    ## Watch the directory of the file by default

    # I'f we've got a string already, use reload
    reload = d.code unless typeof reload is 'string'

    dn = path.dirname path.resolve(reload)
    console.log "Reloading from directory #{dn}"
    opts = {ignored: [/node_modules|[/\\]\./]}
    watcher = watch(dn,opts)
    watcher.on 'change', reloadWebview

  webview.addEventListener 'dom-ready', (e)->
    if devToolsEnabled
      webview.openDevTools()

    webview.send "run-task", {
      code: d.code
      helpers: d.helpers
    }

    webview.addEventListener 'finished', (e)->
      console.log "Finished rendering"

    webview.addEventListener 'devtools-closed', (e)->
      ipcRenderer.send 'dev-tools', 'closed'

renderSpecList = (d)->
  # Render spec list from runner
  el = d3.select @

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
  body.attr 'class','task-list'

  main = d3.select "#main"
  main.html ""
  sel = main.selectAll 'div'
        .data runners

  sel.enter()
    .append 'div'
    .attr 'class', 'runner'
    .each renderSpecList

runBasedOnHash = (runners)->
  z = remote.getGlobal('zoom')
  if webview?
    webview.setZoomFactor z

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

getSpecs = (d)->
  console.log d
  res = require(d)
  Promise.resolve res
    .then (v)->
      v.name = d
      v

loadEntryPoint = (fn)-> ->
  # If we are in spec mode
  if options.specs?
    p = Promise.map options.specs, getSpecs
  else
    spec = new Printer
    spec.task options.outfile, options.infile
    p = Promise.resolve [spec]
  p.then fn

runTask = (spec)->
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

