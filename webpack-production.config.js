const webpack = require('webpack');
const path = require('path');
const buildPath = path.resolve(__dirname, 'qcs/build');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const TransferWebpackPlugin = require('transfer-webpack-plugin');

const config = {
  entry: [path.join(__dirname, '/frontend/src/app/app.jsx')],
  // Render source-map file for final build
  devtool: 'source-map',
  // output config
  output: {
    path: buildPath, // Path of output file
    filename: 'app.js', // Name of output file
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    // Minify the bundle
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        // supresses warnings, usually from module minification
        warnings: false,
        drop_console: true,
      },
    }),
    // Allows error warnings but does not stop compiling.
    new webpack.NoErrorsPlugin(),
    // Transfer Files
    new TransferWebpackPlugin([
      {from: 'www'},
    ], path.resolve(__dirname, 'frontend/src')),
    new webpack.DefinePlugin({
      __FAKEAUTH__: JSON.stringify(false),
      __NOAUTH__: JSON.stringify(false),
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      }
    }),
  ],
  module: {
    loaders: [
      {
        test: /\.jsx$/, // All .js files
        loaders: ['babel-loader'], // react-hot is like browser sync and babel loads jsx and es6-7
        exclude: [nodeModulesPath],
      },
    ],
  },
};

module.exports = config;
