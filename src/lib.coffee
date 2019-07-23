Promise = require 'bluebird'
fs = require 'fs'
{remote, ipcRenderer} = require 'electron'
{createHash} = require 'crypto'
path = require 'path'
d3 = require 'd3-selection'
colors = require 'colors/safe'

options = remote.getGlobal 'options' or {}
options.dpi ?= 96
options.log = false

waitForUserInput = (data)->
  new Promise (resolve, reject)->
    ipcRenderer.once 'done-waiting', ->resolve(data)
    ipcRenderer.send 'wait-for-input'

sleep = (data)->
  new Promise (resolve, reject)->
    fn = ->resolve(data)
    setTimeout fn, 1000

generateFigure = (task)->
  main = d3.select "#pdf-printer-ui-controls"
  main.html ""
  ## Set up a webview
  webview = main.append "webview"
    .attr "nodeintegration", true
    .attr "src", "file://"+require.resolve("../_runner/index.html")
    .node()

  new Promise (resolve, reject)->
    webview.addEventListener 'dom-ready', (e)->
      webview.send "run-task", {
        code: task.code
        helpers: task.helpers
      }
    webview.addEventListener 'ipc-message', (e)->
      if event.channel == 'finished'
        resolve(task)

pixelsToMicrons = (px)->
  Math.ceil(px/96.0*25400)

printToPDF = (webview, opts)->
  new Promise (resolve, reject)->
    ###
    Print the webview to the callback
    ###
    el = document.querySelector("#pdf-printer-figure-container-inner")
    controls = document.querySelector("#pdf-printer-ui-controls")

    # pageSize can be A3, A4, A5, Legal, Letter, Tabloid or an Object
    # containing height and width in microns.
    # (https://electronjs.org/docs/api/web-contents)
    {pageSize, width, height, scaleFactor} = opts
    pageSize ?= {
      height: pixelsToMicrons(height*scaleFactor)
      width: pixelsToMicrons(width*scaleFactor)
    }

    pageSize = "Letter"

    opts = {
      printBackground: true
      marginsType: 0
      pageSize
    }
    el.style.transform = "scale(#{scaleFactor})"
    el.style.transformOrigin = "top left"

    oldDisplay = controls.style.display
    controls.style.display = "none"

    {webContents: wc} = remote.getCurrentWindow()

    console.log opts
    wc.printToPDF opts, (e,data)=>
      console.log e, data
      reject(e) if e?
      resolve(data)
      el.style.transform = null
      el.style.transformOrigin = null
      controls.style.display = oldDisplay


printToImage = (webview, opts)->
  new Promise (resolve, reject)->
    ###
    Print the webview to the callback
    ###
    opts.format ?= 'png'
    opts.scaleFactor ?= 1.8
    opts.quality ?= 90
    {width,height} = opts
    width*=opts.scaleFactor
    height*=opts.scaleFactor
    rect = {x:0,y:30,width,height}
    console.log rect
    webview.capturePage rect, (image)->
      reject(e) if e?
      if ['jpeg','jpg'].includes(opts.format)
        d = image.toJPEG(rect, opts.quality)
      else
        d = image.toPNG(opts.scaleFactor)
      resolve(d)

printFigureArea = (task)->
  ###
  # Function to print webpage
  ###
  console.log task
  opts = task.opts or {}
  {scaleFactor} = opts
  scaleFactor ?= 1
  el = document.querySelector('#pdf-printer-figure-container-inner>*:first-child')

  {width, height} = el.getBoundingClientRect()
  opts = {width, height, scaleFactor}

  {outfile} = task
  dir = path.dirname outfile
  if not fs.existsSync(dir)
    fs.mkdirSync dir
  console.log "Printing to #{outfile}"

  ext = path.extname(outfile)
  wc = remote.getCurrentWebContents()

  if ['.jpg','.jpeg','.png'].includes(ext)
    opts.format = ext.slice(1)
    buf = await printToImage(wc, opts)
  else
    buf = await printToPDF(wc, opts)

  console.log "#{outfile}"
  fs.writeFileSync outfile, buf
  console.log "Finished task"

# Initialize renderer
class Printer
  constructor: (options={})->
    ###
    Setup a rendering object
    ###
    console.log arguments[0]
    @cliOptions = {}
    console.log "Started renderer"

    @options = options
    @options.buildDir ?= ''
    @tasks = []


  task: (fn, funcOrString, opts={})->
    ###
    Add a task
    ###
    opts.dpi ?= 300

    # Check if we've got a function or string
    if typeof funcOrString == 'function'
      throw "We only support strings now, because we run things in a webview"
      func = funcOrString
    else
      # Require relative to parent module,
      # but do it later so errors can be accurately
      # traced
      if not path.isAbsolute(funcOrString)
        func = path.join process.cwd(), funcOrString
      else
        func = funcOrString
      #f = require fn
      #f(el, cb)

    console.log @options
    # Apply build directory
    if fn?
      if not path.isAbsolute(fn)
        fn = path.join(@options.buildDir,fn)
    else
      fn = ""

    h = createHash('md5')
          .update(fn)
          .digest('hex')

    @tasks.push
      outfile: fn
      code: func
      helpers: @options.helpers
      hash: h
      opts: opts
    return @

  run: ->
    # Progress through list of figures, print
    # each one to file
    __runTask = (t)->
      console.log "#{t.code} ⇒ #{t.outfile}"
      p = generateFigure(t)

      if options.waitForUser
        p = p.then waitForUserInput

      p.then printFigureArea
        .catch (e)->console.log('Error: '+e)

    Promise
      .map @tasks, __runTask, concurrency: 1

module.exports = {
  Printer
  printFigureArea
  generateFigure
}
