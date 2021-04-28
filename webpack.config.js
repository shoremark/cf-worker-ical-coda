module.exports = {
  target: 'webworker',
  entry: './index.js',
  mode: 'production',
  node: {
    fs: 'empty',
  },
}
