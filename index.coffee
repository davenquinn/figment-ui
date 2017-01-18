Promise = require 'bluebird'
fs = require 'fs'
{remote, ipcRenderer} = require 'electron'
{createHash} = require 'crypto'
path = require 'path'

generateFigure = (task)->
  el = document.body
  el.innerHTML = ""
  el.style.margin = 0
  console.log "Starting task #{task.outfile}"
  new Promise (resolve, reject)->
    task.function el, (err)->
      if err?
        reject()
      else
        resolve(task)

printFigureArea = (task)->
  el = document.querySelector 'body>*'
  new Promise (resolve, reject)->
    ## Could add error handling with reject
    print el, task.outfile, ->
      console.log "Finished task"
      resolve()

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

    @options.helpers ?= ['css','stylus']
    @__setupHelpers()

  __setupHelpers: ->
    # Apply list of helpers
    # either by getting from registry
    # or by passing a function
    _helpers = require './_helpers'
    for helper in @options.helpers
      console.log "Setting up helper #{helper}"
      try
        helper()
      catch e
        throw e unless e instanceof TypeError
        _helpers[helper]()

  task: (fn, funcOrString)->
    ###
    Add a task
    ###

    # Check if we've got a function or string
    if typeof funcOrString == 'function'
      func = funcOrString
    else
      # Require relative to parent module,
      # but do it later so errors can be accurately
      # traced
      func = (el, cb)->
        f = module.parent.require funcOrString
        f(el, cb)

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
    __runTask = (t)->
      generateFigure(t)
        .then printFigureArea
        .catch (e)->
          try
            console.log e.stack
          catch
            console.log "Unhandled error: #{e}"

    Promise
      .map @tasks, __runTask, concurrency: 1

module.exports =
  Printer: Printer
  print: print
