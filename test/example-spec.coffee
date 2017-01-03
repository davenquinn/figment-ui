{Printer} = require 'pdf-printer'

printer = new Printer buildDir: "#{__dirname}/output"

printer.task('simple-svg.pdf', './simple-svg')

# Export so it can be read by electron
# (this api may change)
module.exports = printer

