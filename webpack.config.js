var babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['env','react'],
    sourceMap: true
  }
}

var coffeeLoader = {
  loader: 'coffee-loader'
  options: {sourceMap: true}
};

module.exports = {
  module: {
    rules: [
      {test: /\.coffee$/, use: [babelLoader, coffeeLoader], exclude: /node_modules/},
      {test: /\.(js|jsx)$/, use: [babelLoader], exclude: /node_modules/},
      {test: /\.styl$/, use: ["style-loader","css-loader", "stylus-loader"]},
      {test: /\.css$/, use: ["style-loader", "css-loader"]},
    ]
  },
  resolve: {extensions: [".coffee", ".js", ".jsx", ".styl"]}
};
