path = require 'path'
fs = require 'fs'
{runBundler} = require '../bundler'
{ipcRenderer} = require 'electron'

runTask = (e, data, callback)->
  ###
  # This is the function that actually runs a discrete task
  ###

  callback ?= null
  {code} = data # The file that has the code in it...
  dn = path.dirname(path.resolve(code))

  cacheDir = path.join(dn, '.cache')
  outDir = path.join(cacheDir,'build')

  proc = runBundler(code, {outDir, cacheDir})
  proc.on 'message', (bundle)->
    el = document.querySelector("#pdf-printer-figure-container")
    newEl = document.createElement('div')
    newEl.id = 'pdf-printer-figure-container'
    el.parentNode.replaceChild(newEl, el)

    console.log "Trying to run task"
    console.log "Ready"
    console.log bundle

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

prepareForPrinting = ->
  el = document.querySelector '#pdf-printer-figure-container>*:first-child'
  {width, height} = el.getBoundingClientRect()
  msg = {
    message: "Ready to print"
    bounds: {width, height: height+2}
  }
  ipcRenderer.sendToHost JSON.stringify(msg)

redirectErrors = ->
  c = remote.getGlobal('console')
  console.log = c.log
  console.error = c.error
  console.warn = c.warn

  # redirect errors to stderr
  window.addEventListener 'error', (e) ->
    e.preventDefault()
    console.error e.error.stack or 'Uncaught ' + e.error

module.exports = {runTask, prepareForPrinting, redirectErrors}
