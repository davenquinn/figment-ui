{select} = require 'd3-selection'

module.exports = (el_, opts, callback)->
  # Create our svg
  el = select el_
    .append 'svg'asdas
    .attr 'width', 200
    .attr 'height', 100

  callback()
