path = require 'path'
fs = require 'fs'
{runBundler} = require '../bundler'
{ipcRenderer} = require 'electron'

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
