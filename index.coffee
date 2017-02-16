Promise = require 'bluebird'
fs = require 'fs'
{remote, ipcRenderer} = require 'electron'
{createHash} = require 'crypto'
path = require 'path'
d3 = require 'd3-selection'

options = remote.getGlobal 'options' or {}
options.dpi ?= 300

waitForUserInput = (data)->
  new Promise (resolve, reject)->
    ipcRenderer.once 'done-waiting', ->resolve(data)
    ipcRenderer.send 'wait-for-input'

sleep = (data)->
  new Promise (resolve, reject)->
    fn = ->resolve(data)
    setTimeout fn, 1000

generateFigure = (task)->
  el = document.body
  el.innerHTML = ""
  el.style.margin = 0
  console.log "Starting task #{task.outfile}"
  new Promise (resolve, reject)->
    # Turn off logging from inside function
    ocl = console.log
    console.log = ->
    task.function el, (err)->
      console.log = ocl
      if err?
        reject()
      else
        resolve(task)

setZoom = (z)->
  d3.select 'body'
    .datum zoom: z
    .style 'zoom', (d)->d.zoom

pixelsToMicrons = (px)->
  Math.ceil(px/96*options.dpi/96*25400)

printFigureArea = (task)->
  opts = task.opts or {}
  opts.selector ?= 'body>*:first-child'
  el = document.querySelector opts.selector

  setZoom(options.dpi/96)

  new Promise (resolve, reject)->
    ###
    Print the webview to the callback
    ###
    c = remote.getCurrentWebContents()
    console.log "Printing to #{task.outfile}"
    v = el.getBoundingClientRect()
    d3.select(el).html()
    console.log v

    opts =
      printBackground: true
      marginsType: 1
      pageSize:
        height: pixelsToMicrons v.height
        width: pixelsToMicrons v.width

    dir = path.dirname task.outfile
    if not fs.existsSync(dir)
      fs.mkdirSync dir

    c.printToPDF opts, (e,d)=>
      throw e if e?
      fs.writeFileSync task.outfile, d
      console.log "Finished task"
      setZoom(1)
      resolve()

# Initialize renderer
class Printer
  constructor: (@options)->
    ###
    Setup a rendering object
    ###
    @cliOptions = {}
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

  task: (fn, funcOrString, opts={})->
    ###
    Add a task
    ###
    opts.dpi ?= 300

    # Check if we've got a function or string
    if typeof funcOrString == 'function'
      func = funcOrString
    else
      # Require relative to parent module,
      # but do it later so errors can be accurately
      # traced
      func = (el, cb)->
        fn = path.join process.cwd(), funcOrString
        f = require fn
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
      opts: opts
    return @

  run: ->
    # Progress through list of figures, print
    # each one to file
    __runTask = (t)->
      p = generateFigure(t)

      if options.waitForUser
        p = p.then waitForUserInput

      p.then printFigureArea
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
