const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'electron-renderer',
  devtool: 'source-map',
  mode: 'development',
  node: {
    __filename: true,
    __dirname: true,
    process: true
  },
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
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: "[name]__[local]___[hash:base64:5]"
              },
              importLoaders: 1
            }
          },
          'stylus-loader'
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      "~": path.resolve(__dirname, 'src')
    }
  },
  entry: {
    main: './src/main.ts',
    index: './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: "[name].js",
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()],
  plugins: [
    new HtmlWebpackPlugin({title: "Figment"})
  ]
}
