runTask = (e, data, callback)->
  callback ?= null
  ### Setup helpers ###
  {helpers, code} = data

  console.log "Trying to run task"
  _helpers = require '../_helpers'
  for helper in helpers
    console.log "Setting up helper #{helper}"
    try
      helper()
    catch e
      throw e unless e instanceof TypeError
      _helpers[helper]()

  el = document.querySelector("#pdf-printer-figure-container")
  func = require code
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
