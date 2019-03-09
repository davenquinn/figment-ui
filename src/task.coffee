path = require 'path'
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

  runBundler(code, {outDir, cacheDir})

  console.log "Trying to run task"
  el = document.querySelector("#pdf-printer-figure-container")
  console.log "Ready"

  compiledCode = path.join(outDir, 'index.js')

  # Race condition
  func = require compiledCode
  func el, callback

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
