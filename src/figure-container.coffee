import {Component} from 'react'
import {AppStateContext} from './state-manager'
import h from 'react-hyperscript'
path = require 'path'
fs = require 'fs'
{runBundler} = require '../bundler'

class FigureContainer extends Component
  @defaultProps: {
    zoomLevel: 1
  }
  render: ->
    {zoomLevel} = @props

    z = if zoomLevel == 1 then null else "scale(#{zoomLevel})"
    style = {
      transform: z
      transformOrigin: "0px 0px"
      padding: "#{20/zoomLevel}px"
    }

    h 'div#pdf-printer-figure-container-outer', null, [
      h 'div#pdf-printer-figure-container', {style}, [
        h 'div#pdf-printer-figure-container-inner'
      ]
    ]

  runTask: (e, data, callback)=>
    ###
    # This is the function that actually runs a discrete task
    ###
    console.log "Running task"

    callback ?= ->
    {code} = data # The file that has the code in it...
    dn = path.dirname(path.resolve(code))

    cacheDir = path.join(dn, '.cache')
    outDir = path.join(cacheDir,'build')

    proc = runBundler(code, {outDir, cacheDir})
    proc.on 'message', (bundle)->
      console.log "Bundling done"
      el = document.querySelector("#pdf-printer-figure-container-inner")
      newEl = document.createElement('div')
      newEl.id = 'pdf-printer-figure-container-inner'
      el.parentNode.replaceChild(newEl, el)

      if bundle.type != 'js'
        throw "Only javascript output is supported (for now)"

      compiledCode = bundle.name

      css = path.join(outDir, 'index.css')
      if fs.existsSync(css)
        styles = fs.readFileSync(css, 'utf-8')
        head = document.querySelector('head')
        style = document.createElement('style')
        head.appendChild(style)
        style.type = 'text/css'
        style.appendChild(document.createTextNode(styles))

      # Race condition
      process.chdir(dn)
      func = require compiledCode
      # Try to make requires relative to initial dir
      func newEl, callback

  componentDidMount: ->
    {task} = @props
    return unless task?
    @runTask null, task

  componentDidUpdate: (prevProps, prevState)->
    {task} = @props
    return unless task?
    if task != prevProps.task
      @runTask null, task

export {FigureContainer}
