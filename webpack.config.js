var
  webpack = require('webpack'),
  ExtractTextPlugin = require("extract-text-webpack-plugin"),
  WebpackNotifierPlugin = require('webpack-notifier')


var amendSources = function(sources) {
  if (process.env.NODE_ENV !== 'production') {
    sources.unshift('webpack/hot/only-dev-server');
  }

  return sources
}

module.exports = {
    entry: amendSources(["./lib/App.jsx"]).concat('bootstrap-sass!./lib/style/bootstrap-sass.config.js'),

    output: {
        path: __dirname + '/dist',
        filename: "dist/bundle.js"
    },

    module: {
        loaders: [
            {test: /\.jsx?$/,                   loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
            {test: /\.js$/,                     loader:  'babel-loader', exclude: /node_modules/ },
            {test: /\.css$/,                    loader:  ExtractTextPlugin.extract('style', 'css-loader') },
            {test: /\.s[ca]ss$/,                loader:  ExtractTextPlugin.extract('style', 'css-loader!sass-loader') },
            {test: /\.(woff|woff2)$/,           loader:  'url-loader?limit=100000' },
            {test: /\.(ttf|eot)$/,              loader:  'file-loader' },
            {test: /\.(png|jpg|jpeg|gif|svg)$/, loader:  'url-loader?limit=10000' },
            {test: /\.json$/, loader:  'json-loader' },
            {test: /\.html$/, loader:  'file-loader?name=[path][name].[ext]' }
        ]
    },

    extensions: ['.jsx', '.js'],

    plugins: [
      new webpack.NoErrorsPlugin(),
      new WebpackNotifierPlugin(),
      new ExtractTextPlugin("dist/bundle.css")
    ]

}
