import {Component} from 'react'
import {AppStateContext} from '../state-manager'
import {hyperStyled} from '@macrostrat/hyper'
import styles from './styles.styl'

h = hyperStyled(styles)

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

class TaskListItem extends Component
  @contextType: AppStateContext
  onClick: =>
    {task} = @props
    @context.selectTask(task)
  render: ->
    {task, displayName} = @props
    h 'li', null, (
      h 'a', {
        href: "##{task.hash}"
        onClick: @onClick
      }, displayName
    )

TaskListSection = (props)->
  {tasks, name} = props

  name ?= "Tasks"
  # Render spec list from runner
  # Find shared starting substring
  arr = tasks.map (d)->d.outfile
  arr.push name

  prefix = sharedStart(arr)

  h 'div.task-list', [
    h 'h2', [
      h 'span.prefix', prefix
      h 'span.name', name.slice(prefix.length)
    ]
    h 'ul', tasks.map (task)->
      displayName = task.outfile.slice(prefix.length)
      h TaskListItem, {displayName, task}
  ]


TaskList = ({runners})->
  h 'div', runners.map (d)->
    h TaskListSection, d

export {TaskList, TaskListItem}
