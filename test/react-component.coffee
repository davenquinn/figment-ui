import h from 'react-hyperscript'

FigureComponent = (props)->
  h 'div', {style: {backgroundColor: 'green', width: 100, height: 300 }}, "Hello"

FigureComponent.propTypes = {}

export default FigureComponent
