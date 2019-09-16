const Visualizer = require('../lib').default;

const v = new Visualizer({buildDir: __dirname+"/output"});
v.task('simple-svg.pdf', './simple-svg.coffee');
v.task('large-svg.pdf', './large-svg.coffee');
v.task('syntax-error.pdf', './syntax-error.coffee');
v.task('react-component.pdf', './react-component.coffee');
v.task('invalid.pdf', './invalid-export.coffee');

module.exports = v
