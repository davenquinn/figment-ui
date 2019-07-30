import {Component} from 'react'
import h from '~/hyper'
import {Spinner} from '@blueprintjs/core'
import {TaskElement, TaskStylesheet} from './elements'
import {TaskShape} from './types'
import chokidar from 'chokidar'

path = require 'path'
fs = require 'fs'
{runBundler} = require '../bundler'

sleep = (timeout=1000)->
  new Promise (resolve, reject)->
    fn = ->resolve()
    setTimeout fn, timeout


class TaskRenderer extends Component
  @propTypes: {
    task: TaskShape.isRequired
  }
  constructor: (props)->
    super props
    @bundler = null
    @currentBundle = null
    @watcher = null
    @state = {
      code: null
      styles: null
    }
  render: ->
    {code, styles} = @state
    if not code? and not styles?
      return h 'div.progress', [
        h Spinner
        h 'p', "Bundling code"
      ]
    h 'div.figure-container-inner', [
      h TaskStylesheet, {styles}
      h TaskElement, {code}
    ]
  startBundler: =>
    ###
    # This is the function that actually runs a discrete task
    ###
    {task} = @props
    console.log "Running task"

    {code: codeFile} = task # The file that has the code in it...
    dn = path.dirname(path.resolve(codeFile))

    cacheDir = path.join(dn, '.cache')
    outDir = path.join(cacheDir,'build')

    @bundler = runBundler(codeFile, {outDir, cacheDir, cache: true})

    @bundler.on 'buildStart', (bundle)=>
      @onBundlingStarted(bundle)

    @bundler.on 'bundled', (bundle)=>
      @onBundlingFinished(bundle, outDir)

  onBundlingStarted: (bundle)=>
    console.log "Bundling started"
    @currentBundle = null
    @setState {code: null, styles: null}

  onBundlingFinished: (bundle, outDir)=>
    console.log bundle
    console.log "Bundling done"
    @currentBundle = bundle
    if not @watcher?
      @watcher = chokidar.watch bundle.name
        .on 'all', @onUpdateCode

  onUpdateCode: =>
    return unless @currentBundle?
    bundle = @currentBundle

    if bundle.type != 'js'
      throw "Only javascript output is supported (for now)"

    cssFile = bundle.siblingBundlesMap.get("css").name
    # Get css and javascript
    styles = null
    if fs.existsSync(cssFile)
      styles = fs.readFileSync(cssFile, 'utf-8')

    compiledCode = bundle.name
    console.log "Requiring compiled code from #{bundle.name}"
    v = require.resolve(compiledCode)
    delete require.cache[v]
    code = require v
    @setState {code, styles}

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
