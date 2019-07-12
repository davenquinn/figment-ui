import {Component} from 'react'
import h from 'react-hyperscript'
import {findDOMNode} from 'react-dom'
import isReact from 'is-react'

class TaskElement extends Component
  @defaultProps: {
    code: null
    callback: null
  }
  render: ->
    {code} = @props
    return null unless code?
    try
      children = h(code)
      return h 'div', {children}
    catch
      return h 'div'

  runTask: =>
    {code, callback} = @props
    return unless code?
    # React components are handled directly
    return
    # Here is where we would accept different
    # types of components
    func = code
    callback ?= ->

    el = findDOMNode(@)
    func el, callback
  componentDidMount: ->
    @runTask()
  componentDidUpdate: (prevProps)->
    return if prevProps.code == @props.code
    @runTask()

class TaskStylesheet extends Component
  render: ->
    h 'style', {type: 'text/css'}
  mountStyles: ->
    el = findDOMNode @
    {styles} = @props
    return unless styles?
    el.appendChild(document.createTextNode(styles))
  componentDidMount: ->
    @mountStyles()
  componentDidUpdate: (prevProps)->
    return if prevProps.styles == @props.styles
    @mountStyles()

export {TaskElement, TaskStylesheet}
