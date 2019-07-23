import {Component} from 'react'
import h from 'react-hyperscript'
import {TaskElement, TaskStylesheet} from './elements'
import {TaskShape} from './types'

path = require 'path'
fs = require 'fs'
{runBundler} = require '../../bundler'

class TaskRenderer extends Component
  constructor: (props)->
    super props
    @bundler = null
    @state = {
      code: null
      styles: null
    }
  render: ->
    {code, styles} = @state
    if not code? and not styles?
      return h 'div#pdf-printer-progress-indicator', [
        h 'p', "Creating bundle..."
      ]
    h 'div#pdf-printer-figure-container-inner', [
      h TaskStylesheet, {styles}
      h TaskElement, {code}
    ]
  startBundler: =>
    ###
    # This is the function that actually runs a discrete task
    ###
    @bundler.kill(0) if @bundler?

    {task} = @props
    console.log "Running task"

    {code: codeFile} = task # The file that has the code in it...
    dn = path.dirname(path.resolve(codeFile))

    cacheDir = path.join(dn, '.cache')
    outDir = path.join(cacheDir,'build')

    @bundler = runBundler(codeFile, {outDir, cacheDir})
    console.log "Running bundler process with PID #{@bundler.pid}"
    process.on 'exit', =>
      @bundler.kill()

    @bundler.on 'message', (bundle)=>
      console.log "Bundling done"

      if bundle.type != 'js'
        throw "Only javascript output is supported (for now)"

      # Get css and javascript
      cssFile = path.join(outDir, 'index.css')
      styles = null
      if fs.existsSync(cssFile)
        styles = fs.readFileSync(cssFile, 'utf-8')

      compiledCode = bundle.name
      code = require compiledCode
      @setState {code, styles}

  componentDidMount: ->
    {task} = @props
    return unless task?
    @startBundler task

  componentDidUpdate: (prevProps)->
    {task} = @props
    return if prevProps.task == task
    @startBundler task

  componentWillUnmount: ->
    return unless @bundler?
    @bundler.kill(0)

export {TaskRenderer}
