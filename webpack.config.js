const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// const {server} = require('./src/server');
module.exports = {
  entry: {
    app: ['./src/main.js'],
    styles: ['./css/reset.css', './css/style.css']
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'build'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.js?$/,
        use: {
          loader: 'babel-loader',
          options:{
            presets: ['@babel/preset-env']
          }
        },
        include: path.resolve(__dirname, 'src/'),
        exclude: /node_modules/,
      }
    ]
  },
  // target: 'web',
  devtool: 'inline-source-map',

  devServer: {
    contentBase: path.resolve(__dirname, 'build'),
    host: '0.0.0.0',
    port: 8192,
    //https: true,
    overlay: {
      //warnings: true,
      errors: true
    },
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename:"index.html",
      template:'./index.ejs'
    }),
    new MiniCssExtractPlugin({
      chunkFilename: "static/css/[name].[hash].css",
      filename: "static/[name].[hash].css"
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'assets', '**', '*'),
        to: path.resolve(__dirname, 'build'),
      },
    ]),
    new webpack.DefinePlugin({
      'typeof CANVAS_RENDERER': JSON.stringify(true),
      'typeof WEBGL_RENDERER': JSON.stringify(true),
    })
  ],

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
