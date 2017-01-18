{remote, ipcRenderer} = require 'electron'
path = require 'path'
d3 = require 'd3-selection'

try
  require '../_helpers/stylus-css-modules'
catch e
  console.log "Couldn't import helper for stylus css modules,
               stylus and css-modules-require-hook should be installed"

createMainPage = null

body = d3.select 'body'
main = d3.select '#main'
title = d3.select '#controls>h1'
d3.select '#toggle-dev-tools'
  .on 'click', ->
    ipcRenderer.send 'toggle-dev-tools'

sharedStart = (array) ->
  # From
  # http://stackoverflow.com/questions/1916218/find-the-longest-common-starting-substring-in-a-set-of-strings
  A = array.concat().sort()
  a1 = A[0]
  a2 = A[A.length - 1]
  L = a1.length
  i = 0
  while i < L and a1.charAt(i) == a2.charAt(i)
    i++
  a1.substring 0, i

itemSelected = (d)->
  location.hash = "##{d.hash}"
  body.attr 'class','figure'
  title
    .html ""
    .append 'a'
    .attr 'href','#'
    .text '◀︎ Back to list'
    .on 'click', createMainPage

  main.html ""
  d.function main.node()

renderSpecList = (d)->
  el = d3.select @

  # Find shared starting substring
  arr = d.tasks.map (d)->d.outfile
  arr.push d.name

  prefix = sharedStart(arr)

  el.append 'h5'
    .text prefix

  el.append 'h2'
    .text d.name.slice(prefix.length)

  sel = el
    .append 'ul'
    .selectAll 'li'
    .data d.tasks

  sel.enter()
    .append 'li'
    .append 'a'
      .attr 'href',(d)->"##{d.hash}"
      .text (d)->d.outfile.slice(prefix.length)
      .on 'click', itemSelected

specs = remote.getGlobal 'specs'

runners = specs.map (d)->
  o = require d
  o.name = d
  return o

createMainPage = ->
  # Create a list of tasks
  body.attr 'class','task-list'

  title
    .html ""
    .text 'Figure index'

  main.html ""
  sel = main.selectAll 'div'
        .data runners

  sel.enter()
    .append 'div'
    .attr 'class', 'runner'
    .each renderSpecList

render = ->
  if location.hash.length > 1
    console.log "Attempting to navigate to #{location.hash}"
    # Check if we can grab a dataset
    _ = runners.map (d)->d.tasks
    tasks = Array::concat.apply [], _
    for item in tasks
      if item.hash == location.hash.slice(1)
        itemSelected item
        return

  # If no hash then create main page
  createMainPage()

render()

