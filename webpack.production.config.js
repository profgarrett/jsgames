// require('@babel/polyfill');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
//const { GOOGLEID } = require('./secret.distribution.js');

module.exports = {
	mode: 'production',
	entry: [ __dirname + '/src/app/index.jsx'],
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx' ],
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.wasm$/,
				type: 'javascript/auto',
			},
			{
				test: /\.?jsx$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.?js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.?ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.?tsx$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
		]
	},
	plugins: [
		new CleanWebpackPlugin(), // wipe out all bad files.
		new HTMLWebpackPlugin({
			template: __dirname + '/src/app/index.html',
			filename: 'index.html',
			inject: 'body'
		}),
		
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		})
	],
	
	optimization: {
		/*
		minimize: true,
		minimizer: [new TerserPlugin({
			terserOptions: { sourceMap: true }
		})],
		*/
		minimize: false
	},
	
	output: {
		filename: '[name].[chunkhash].js',
		sourceMapFilename: "[name].[chunkhash].js.map",
		publicPath: '/',
		path:   __dirname + '/build/public'
	},
	devtool: 'source-map',

	devServer: {
		port: 8080,
		proxy: {
			'/api': {
				target: 'http://localhost:9000/',
				secure: false
			}
		},
		historyApiFallback: true
	}

};
