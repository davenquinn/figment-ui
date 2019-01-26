{select} = require 'd3-selection'

module.exports = (el_, callback)->

  # Create our svg
  el = select el_
    .append 'svg'
    .attr 'width', 200
    .attr 'height', 100

  el.append 'text'
    .text 'Test PDF creation'
    .attr 'y', 50

  callback()

