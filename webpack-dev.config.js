const webpack = require('webpack');
const path = require('path');
const buildPath = path.resolve(__dirname, 'qcs/build');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const TransferWebpackPlugin = require('transfer-webpack-plugin');

const config = {
  // Entry points to the project
  entry: [
    path.join(__dirname, '/frontend/src/app/app.jsx'),
  ],
  devtool: 'eval',
  output: {
    path: buildPath, // Path of output file
    filename: 'app.js',
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    // Allows error warnings but does not stop compiling.
    new webpack.NoErrorsPlugin(),
    // Moves files
    new TransferWebpackPlugin([
      {from: 'www'},
    ], path.resolve(__dirname, 'frontend/src')),
    new webpack.DefinePlugin({
      __FAKEAUTH__: JSON.stringify(true),
    }),
  ],
  module: {
    loaders: [
      {
        // React-hot loader and
        test: /\.jsx$/, // All .js files
        loaders: ['react-hot', 'babel-loader'], // react-hot is like browser sync and babel loads jsx and es6-7
        exclude: [nodeModulesPath],
      },
    ],
  },
};

module.exports = config;
