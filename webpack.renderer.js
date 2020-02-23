const path = require('path');
const nodeExternals = require('webpack-node-externals')

const cssModuleLoader = {
  loader: 'css-loader',
  options: { modules: true, importLoaders: 1 }
};

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          cssModuleLoader,
          'postcss-loader',
          'stylus-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      "~": path.resolve(__dirname, 'src')
    }
  },
  externals: [nodeExternals()]
}
