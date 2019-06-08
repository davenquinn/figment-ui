import {Component} from 'react'
import h from 'react-hyperscript'
import {TaskElement, TaskStylesheet} from './elements'

path = require 'path'
fs = require 'fs'
{runBundler} = require '../../bundler'

class TaskRenderer extends Component
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
    @runBundler null, task

export {TaskRenderer}
