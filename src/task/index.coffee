import {Component} from 'react'
import h from '~/hyper'
import {TaskElement, TaskStylesheet} from './elements'
import {TaskShape} from './types'
import PacmanLoader from 'react-spinners/PacmanLoader'
import {BundlerError} from './error'
import {FigureContainer} from '../figure-container'
import T from 'prop-types'
import {MarginType} from '~/types'
import {AppToaster} from '~/toaster'
import Bundler from 'parcel-bundler'
import path from 'path'
import decache from 'decache'
import fs from 'fs'
import requireStack from 'require-stack'

createBundler = (file, opts)->

  options = {
    hmr: false,
    outDir: 'dist', # The out directory to put the build files in, defaults to dist
    publicUrl: './', # The url to server on, defaults to dist
    watch: true, # whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
    cache: true, # Enabled or disables caching, defaults to true
    cacheDir: '.cache', # The directory cache gets put in, defaults to .cache
    contentHash: false, # Disable content hash from being included on the filename
    minify: false, # Minify files, enabled if process.env.NODE_ENV === 'production'
    scopeHoist: false, # turn on experimental scope hoisting/tree shaking flag, for smaller production bundles
    target: 'electron', # browser/node/electron, defaults to browser
    https: false, # Serve files over https or http, defaults to false
    logLevel: 3, # 3 = log everything, 2 = log warnings & errors, 1 = log errors
    #hmrPort: 0, # The port the HMR socket runs on, defaults to a random free port (0 in node.js resolves to a random free port)
    sourceMaps: true, # Enable or disable sourcemaps, defaults to enabled (not supported in minified builds yet)
    #hmrHostname: '', # A hostname for hot module reload, default to ''
    detailedReport: true, # Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
    bundleNodeModules: false,
    opts...
  }

  bundler = new Bundler(file, options)
  return bundler


sleep = (timeout=1000)->
  new Promise (resolve, reject)->
    fn = ->resolve()
    setTimeout fn, timeout

Spinner = ->
  h PacmanLoader, {size: 20, sizeUnit: 'px', color: '#aaa'}

class TaskRenderer extends Component
  @propTypes: {
    task: TaskShape
    marginTop: MarginType
    zoomLevel: T.number
  }
  constructor: (props)->
    super props
    @bundler = null
    @state = {
      code: null
      styles: null
      error: null
      size: null
    }
  render: ->
    {task, zoomLevel, marginTop} = @props
    {opts} = task
    {multiPage} = opts
    multiPage ?= false

    {code, styles, error, size} = @state
    width = null
    if size?
      width = size.width

    if not task?
      return null
    if error?
      return h BundlerError, {error}
    if not code? and not styles?
      return h 'div.progress', {style: {marginTop}}, [
        h Spinner
        h 'p', "Digesting your code"
      ]
    h FigureContainer, {marginTop, zoomLevel, multiPage, width},  [
      h TaskStylesheet, {styles}
      h TaskElement, {code, recordSize: @recordSize, opts}
    ]

  recordSize: ({width, height})=>
    @setState {size: {width, height}}

  startBundler: =>
    ###
    # This is the function that actually runs a discrete task
    ###
    {task} = @props
    console.log "Running task"

    {code: codeFile} = task # The file that has the code in it...
    dn = path.dirname(path.resolve(codeFile))
    console.log dn

    cacheDir = path.join(dn, '.cache')
    outDir = path.join(cacheDir,'build')

    try
      process.chdir(dn)
    catch err
      @setState {error: err}
      return

    @bundler = createBundler(codeFile, {outDir, cacheDir})
    console.log "Running bundler process with PID #{@bundler.pid}"
    @bundler.bundle()
      .catch (e)=> console.error e

    @bundler.on 'buildStart', (bundle)=>
      @onBundlingStarted(bundle)

    @bundler.on 'buildError', (error)=>
      @handleBundleError(error)

    @bundler.on 'bundled', (bundle)=>
      @onBundlingFinished(bundle, outDir)

  onBundlingStarted: (bundle)=>
    console.log "Bundling started"
    @setState {code: null, styles: null, error: null}

  handleBundleError: (err)=>
    console.error(err)
    @setState {error: err}

  onBundlingFinished: (bundle, outDir)=>
    if @state.error?
      return
    console.clear()
    console.log "Bundling done"
    msg = "Built in #{bundle.bundleTime}ms"
    AppToaster.show({message: msg, intent: "success", icon: 'clean', timeout: 4000})

    if bundle.type != 'js'
      throw "Only javascript output is supported (for now)"

    styles = null
    cssFile = bundle.siblingBundlesMap.get("css")
    # Get css and javascript
    if cssFile? and fs.existsSync(cssFile.name)
      styles = fs.readFileSync(cssFile.name, 'utf-8')

    console.log "Requiring compiled code from '#{bundle.name}'"

    # Reset require paths for imported module
    # https://tech.wayfair.com/2018/06/custom-module-loading-in-a-node-js-environment/
    fn = path.basename(bundle.name)
    dn = path.dirname(bundle.name)

    decache(bundle.name)
    oldPaths = [global.require.main.paths...]
    # Add new paths to require
    dirnamePaths = []
    _dir = dn
    until _dir == "/"
      dirnamePaths.push(path.join(_dir, "node_modules"))
      _dir = path.resolve(path.join(_dir, ".."))
    # Monkey-patch the global require
    global.require.main.paths = [dn, dirnamePaths..., oldPaths...]
    code = require(bundle.name)
    global.require.main.paths = oldPaths
    @setState {code, styles, error: null}

  componentDidMount: ->
    {task} = @props
    return unless task?
    @startBundler task

  componentDidUpdate: (prevProps)->
    {task} = @props
    return if prevProps.task == task
    #@startBundler task

  componentWillUnmount: ->
    return unless @bundler?
    @bundler.stop()

export {TaskRenderer, TaskShape}
