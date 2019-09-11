import h from 'react-hyperscript'

FigureComponent = (props)->
  h 'div', {style: {backgroundColor: 'green', width: 100, height: 300 }}, "Hello"

# This must be set
FigureComponent.isReactComponent = true

export default FigureComponent
