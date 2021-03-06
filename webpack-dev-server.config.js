const webpack = require('webpack');
const path = require('path');
const buildPath = path.resolve(__dirname, 'qcs/build');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const TransferWebpackPlugin = require('transfer-webpack-plugin');

const config = {
  // Entry points to the project
  entry: [
    'webpack/hot/dev-server',
    'webpack/hot/only-dev-server',
    path.join(__dirname, '/frontend/src/app/app.jsx'),
  ],
  // Server Configuration options
  devServer: {
    contentBase: 'frontend/src/www', // Relative directory for base of server
    devtool: 'eval',
    hot: true, // Live-reload
    inline: true,
    port: 3000, // Port Number
    host: 'localhost', // Change to '0.0.0.0' for external facing server
  },
  devtool: 'eval',
  output: {
    path: buildPath, // Path of output file
    filename: 'app.js',
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    // Enables Hot Modules Replacement
    new webpack.HotModuleReplacementPlugin(),
    // Allows error warnings but does not stop compiling.
    new webpack.NoErrorsPlugin(),
    // Moves files
    new TransferWebpackPlugin([
      {from: 'www'},
    ], path.resolve(__dirname, 'frontend/src')),
    new webpack.DefinePlugin({
      __FAKEAUTH__: JSON.stringify(false),
      __NOAUTH__: JSON.stringify(true)
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
