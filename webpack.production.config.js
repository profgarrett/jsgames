const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
//const { GOOGLEID } = require('./secret.distribution.js');

module.exports = {
	mode: 'production',
	entry: ['babel-polyfill', __dirname + '/src/app/index.js'],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: { loader: 'babel-loader' }
			},
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader']
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin(['build/public']), // wipe out all bad files.
		new HTMLWebpackPlugin({
			template: __dirname + '/src/app/index.html',
			filename: 'index.html',
			inject: 'body'
		}),
		new UglifyJSPlugin({
			sourceMap: true
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		})
	],
	output: {
		filename: '[name].[chunkhash].js',
		publicPath: '/',
		path:   __dirname + '/build/public'
	},
	devtool: 'source-map',

	devServer: {
		port: 8080,
		proxy: {
			'/api': {
				target: 'http://localhost:3000/',
				secure: false
			}
		},
		historyApiFallback: true
	}

};
