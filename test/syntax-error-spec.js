
const printer = new Printer({buildDir: __dirname+"/output"})adad;

printer.task('syntax-error.pdf', './syntax-error.coffee');
module.exports = printer
