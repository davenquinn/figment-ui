import {Component} from 'react'
import {AppStateContext} from './state-manager'
import h from 'react-hyperscript'
import {findDOMNode} from 'react-dom'

path = require 'path'
fs = require 'fs'
{runBundler} = require '../bundler'

class TaskElement extends Component
  @defaultProps: {
    code: null
    callback: null
  }
  render: ->
    h 'div'
  runTask: =>
    {code, callback} = @props
    return unless code?
    # Here is where we would accept different
    # types of components
    func = code
    callback ?= ->

    el = findDOMNode(@)
    func el, callback
  componentDidMount: ->
    @runTask()
  componentDidUpdate: (prevProps)->
    return if prevProps.code == @props.code
    @runTask()


class TaskStylesheet extends Component
  render: ->
    h 'style', {type: 'text/css'}
  mountStyles: ->
    el = findDOMNode @
    {styles} = @props
    return unless styles?
    el.appendChild(document.createTextNode(styles))
  componentDidMount: ->
    @mountStyles()
  componentDidUpdate: (prevProps)->
    return if prevProps.styles == @props.styles
    @mountStyles()

class TaskHolder extends Component
  constructor: (props)->
    super props
    @state = {
      code: null
      styles: null
    }
  render: ->
    {code, styles} = @state
    if not code? and not styles?
      h 'div#pdf-printer-progress-indicator', [
        h 'p', "Creating bundle..."
      ]
    h 'div#pdf-printer-figure-container-inner', [
      h TaskStylesheet, {styles}
      h TaskElement, {code}
    ]
  runBundler: (e, data, callback)=>
    ###
    # This is the function that actually runs a discrete task
    ###
    console.log "Running task"

    {code: codeFile} = data # The file that has the code in it...
    dn = path.dirname(path.resolve(codeFile))

    cacheDir = path.join(dn, '.cache')
    outDir = path.join(cacheDir,'build')

    proc = runBundler(codeFile, {outDir, cacheDir})
    proc.on 'message', (bundle)=>
      console.log "Bundling done"

      if bundle.type != 'js'
        throw "Only javascript output is supported (for now)"

      compiledCode = bundle.name

      cssFile = path.join(outDir, 'index.css')
      styles = null
      if fs.existsSync(cssFile)
        styles = fs.readFileSync(cssFile, 'utf-8')

      code = require compiledCode
      @setState {code, styles}

  componentDidMount: ->
    {task} = @props
    return unless task?
    @runBundler null, task

class FigureContainer extends Component
  @defaultProps: {
    zoomLevel: 1
  }
  render: ->
    {zoomLevel, task} = @props

    z = if zoomLevel == 1 then null else "scale(#{zoomLevel})"
    style = {
      transform: z
      transformOrigin: "0px 0px"
      padding: "#{20/zoomLevel}px"
    }

    h 'div#pdf-printer-figure-container-outer', null, [
      h 'div#pdf-printer-figure-container', {style}, [
        h TaskHolder, {task}
      ]
    ]

export {FigureContainer}
