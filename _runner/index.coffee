path = require 'path'
Promise = require 'bluebird'
{remote, ipcRenderer} = require 'electron'
options = remote.getGlobal 'options'
console.log options

ipcRenderer.on 'run-task', (e,data)->
  ### Setup helpers ###
  {helpers, code} = data

  _helpers = require '../_helpers'
  for helper in helpers
    console.log "Setting up helper #{helper}"
    try
      helper()
    catch e
      throw e unless e instanceof TypeError
      _helpers[helper]()

  callback = ->
    ipcRenderer.send "finished"

  func = require code
  func document.querySelector("body"), callback

redirectErrors = ->
  c = remote.getGlobal('console')
  console.log = c.log
  console.error = c.error
  console.warn = c.warn

  # redirect errors to stderr
  window.addEventListener 'error', (e) ->
    e.preventDefault()
    console.error e.error.stack or 'Uncaught ' + e.error

