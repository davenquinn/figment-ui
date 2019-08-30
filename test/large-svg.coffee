{select} = require 'd3-selection'
require './large-svg.styl'

module.exports = (el_, callback)->
  # Create our svg
  el = select el_
    .append 'svg'
    .attr 'width', 1200
    .attr 'height', 600

  el.append 'rect'
    .attr 'width', 1200
    .attr 'height', 600
    .attr 'fill', '#aaa'

  el.append 'text'
    .text 'Test PDF creation'
    .attr 'y', 50

  callback()
