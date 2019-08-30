import h from 'react-hyperscript'
import {render} from 'react-dom'

el = h 'div', [
  h 'h1', "Test"
]

render(el,document.body)
