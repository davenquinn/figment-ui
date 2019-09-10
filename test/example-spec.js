
const printer = new Printer({buildDir: __dirname+"/output"});
printer.task('simple-svg.pdf', './simple-svg.coffee');
printer.task('large-svg.pdf', './large-svg.coffee');
printer.task('syntax-error.pdf', './syntax-error.coffee');
module.exports = printer
