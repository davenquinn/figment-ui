{remote, ipcRenderer} = require 'electron'
path = require 'path'
Promise = require 'bluebird'
readline = require 'readline'

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

specs = remote.getGlobal 'specs'

runTask = (spec)->
  "Running tasks from #{spec}"
  taskRunner = require spec
  Promise.resolve taskRunner
    .then (t)->t.run()

specMode = remote.getGlobal 'specMode'
if specMode
  console.log "Running from spec"
  p = Promise.map specs, runTask, concurrency: 1
else
  [infile, outfile] = remote.getGlobal 'args'
  taskRunner = new Printer
  taskRunner.task outfile, infile
  p = taskRunner.run()
p.then finish
