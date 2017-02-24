printer = new Printer buildDir: "#{__dirname}/output"
printer.task('simple-svg.pdf', './simple-svg')
module.exports = printer
