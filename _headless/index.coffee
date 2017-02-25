{remote, ipcRenderer} = require 'electron'
path = require 'path'
Promise = require 'bluebird'
readline = require 'readline'

options = remote.getGlobal 'options'

{Printer} = require("../index.coffee")
window.Printer = Printer

c = remote.getGlobal('console')
console.log = c.log
console.error = c.error
console.warn = c.warn
process.exit = remote.app.quit

# redirect errors to stderr
window.addEventListener 'error', (e) ->
  e.preventDefault()
  console.error e.error.stack or 'Uncaught ' + e.error

finish =->
  console.log "Done!"
  remote.app.quit()

runTask = (spec)->
  "Running tasks from #{spec}"
  taskRunner = require spec
  Promise.resolve taskRunner
    .then (t)->t.run()

if options.specs?
  console.log "Running from spec"
  p = Promise.map options.specs, runTask, concurrency: 1
else
  taskRunner = new Printer
  taskRunner.task options.outfile, options.infile
  p = taskRunner.run()
p.then finish
