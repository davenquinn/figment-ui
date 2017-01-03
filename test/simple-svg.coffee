d3 = require 'd3'

module.exports = (el_, callback)->

  # Create our svg
  el = d3.select el_
    .append 'svg'
    .attr 'width', 200
    .attr 'height', 100

  el.append 'text'
    .text 'Test PDF creation'
    .attr 'y', 50

  callback()

