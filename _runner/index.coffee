path = require 'path'
Promise = require 'bluebird'
{remote, ipcRenderer} = require 'electron'
options = remote.getGlobal 'options'
console.log options

setZoom = (z)->
  d3.select 'body'
    .datum zoom: z
    .style 'zoom', (d)->d.zoom

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
    ipcRenderer.sendToHost "finished"

  func = require code
  func document.querySelector("body"), callback

ipcRenderer.on 'prepare-for-printing', ->
  el = document.querySelector 'body>*:first-child'
  {width, height} = el.getBoundingClientRect()
  msg = {
    message: "Ready to print"
    bounds: {width, height}
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

