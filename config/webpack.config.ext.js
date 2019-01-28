const path = require('path');
const prod = require('./webpack.config.prod');

const entry = {};
[
  'background.js',
  'content.js',
  'inject.js',
  'prompt.js'
].forEach(f => {
  entry[f] = path.join(__dirname, `../src/${f}`);
});

delete prod.optimization.splitChunks;
prod.optimization.runtimeChunk = false;

module.exports = {
  entry,
  output: {
    path: path.join(__dirname, '../build'),
    filename: '[name]',
  },
  node: prod.node,
  optimization: prod.optimization,
  resolve: prod.resolve,
  resolveLoader: prod.resolveLoader,
  module: prod.module
};