const path = require('path');
const {IgnorePlugin, DefinePlugin} = require('webpack');

const mode = 'development';

const babelLoader = {
  loader: 'babel-loader'
};

const coffeeLoader = {
  loader: 'coffee-loader',
  options: {sourceMap: true}
};

const jsRule = {
  test: /\.(js|jsx|ts|tsx)$/,
  use: [babelLoader],
  exclude: /node_modules/
}

const coffeeRule = {
  test: /\.coffee$/,
  use: [babelLoader, coffeeLoader],
  exclude: [/node_modules/]
}


module.exports = {
  devtool: "source-map",
  mode,
  module: {
    rules: [
      coffeeRule,
      {
        test: /\.styl$/,
        use: [
          "style-loader",
          'css-loader',
          "stylus-loader"
        ],
        exclude: /node_modules/
      },
      jsRule
    ]
  },
  resolve: {
    extensions: ['.js', '.coffee'],
  }
};
