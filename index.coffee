Promise = require 'bluebird'
fs = require 'fs'
{remote, ipcRenderer} = require 'electron'
{createHash} = require 'crypto'
path = require 'path'

runTask = (task)->
  ###
  Run a single printing task from a task spec
  ###
  runFunction = new Promise (resolve, reject)->
    el = document.body
    el.innerHTML = ""
    el.style.margin = 0
    task.function el, resolve
  printDataset = new Promise (resolve, reject)->
    # Could add error handling with reject
    el = document.querySelector 'body>*'
    print el, task.outfile, ->
      console.log "Finished task"
      resolve()

  runFunction
    .then printDataset

pixelsToMicrons = (px)->
  Math.ceil(px/96*25400)

print = (el, filename, callback)->
  ###
  Print the webview to the callback
  ###
  c = remote.getCurrentWebContents()
  console.log "Printing to #{filename}"
  v = el.getBoundingClientRect()

  opts =
    printBackground: true
    marginsType: 1
    pageSize:
      height: pixelsToMicrons v.height
      width: pixelsToMicrons v.width

  dir = path.dirname filename
  if not fs.existsSync(dir)
    fs.mkdirSync dir

  c.printToPDF opts, (e,d)=>
    fs.writeFileSync filename, d
    callback()

# Initialize renderer
class Printer
  constructor: (@options)->
    ###
    Setup a rendering object
    ###
    console.log "Started renderer"

    @options.buildDir ?= ''
    @tasks = []

  task: (fn, funcOrString)->
    ###
    Add a task
    ###

    # Check if we've got a function or string
    if typeof funcOrString == 'function'
      func = funcOrString
    else
      # Require relative to parent module
      func = module.parent.require funcOrString

    # Apply build directory
    if not path.isAbsolute(fn)
      fn = path.join(@options.buildDir,fn)

    h = createHash('md5')
          .update(fn)
          .digest('hex')

    @tasks.push
      outfile: fn
      function: func
      hash: h
    return @

  run: ->
    # Progress through list of figures, print
    # each one to file
    Promise
      .map @tasks, runTask, concurrency: 1

module.exports =
  Printer: Printer
  print: print
