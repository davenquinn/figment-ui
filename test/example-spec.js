const Figment = require('../lib').default;

const v = new Figment({buildDir: __dirname+"/output"});
v.task('simple-svg.pdf', './simple-svg.coffee');
v.task('large-svg.pdf', './large-svg.coffee');
v.task('webpack.pdf', './large-svg.coffee', {webpackConfig: "./webpack.config.js"})
v.task('syntax-error.pdf', './syntax-error.coffee');
v.task('react-component.pdf', './react-component.coffee');
v.task('invalid.pdf', './invalid-export.coffee');

module.exports = v
