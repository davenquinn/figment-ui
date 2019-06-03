import {Component} from 'react'
import h from 'react-hyperscript'

sharedStart = (array) ->
  # From
  # http://stackoverflow.com/questions/1916218/
  #       find-the-longest-common-starting-substring-in-a-set-of-strings
  A = array.concat().sort()
  a1 = A[0]
  a2 = A[A.length - 1]
  L = a1.length
  i = 0
  while i < L and a1.charAt(i) == a2.charAt(i)
    i++
  a1.substring 0, i

itemSelected = null

TaskListItem = (props)->
  {hash, displayName} = props
  h 'li', null, (
    h 'a', {
      href: "##{hash}"
      onClick: itemSelected
    }, displayName
  )

TaskListSection = (props)->
  {tasks, name} = props

  # Render spec list from runner
  # Find shared starting substring
  arr = tasks.map (d)->d.outfile
  arr.push name

  prefix = sharedStart(arr)

  h 'div.task-list', [
    h 'h5', prefix
    h 'h2', name.slice(prefix.length)
    h 'ul', tasks.map (d)->
      displayName = d.outfile.slice(prefix.length)
      h TaskListItem, {displayName, d...}
  ]


TaskList = ({runners})->
  h 'div', runners.map (d)->
    h TaskListSection, d

export {TaskList}

