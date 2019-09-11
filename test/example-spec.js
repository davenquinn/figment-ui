
const printer = new Printer({buildDir: __dirname+"/output"});
printer.task('simple-svg.pdf', './simple-svg.coffee');
printer.task('large-svg.pdf', './large-svg.coffee');
printer.task('syntax-error.pdf', './syntax-error.coffee');
printer.task('react-component.pdf', './react-component.coffee');
printer.task('invalid.pdf', './invalid-export.coffee');

module.exports = printer
