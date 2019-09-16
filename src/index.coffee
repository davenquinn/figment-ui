Promise = require 'bluebird'
fs = require 'fs'
{remote, ipcRenderer} = require 'electron'
{createHash} = require 'crypto'
path = require 'path'
import {TaskShape} from './task/types'

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

# Initialize renderer
class Visualizer
  constructor: (options={})->
    ###
    Setup a rendering object
    ###
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
        workingDirectory = remote.getGlobal('workingDirectory')
        func = path.join workingDirectory, funcOrString
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

    @tasks.push {
      outfile: fn
      code: func
      helpers: @options.helpers
      hash: h
      multiPage: opts.multiPage or false
      opts: opts
    }
    return @

export default Visualizer
