printer = new Printer buildDir: "#{__dirname}/output"
printer.task('simple-svg.pdf', './simple-svg')
printer.task('large-svg.pdf', './large-svg')
module.exports = printer
