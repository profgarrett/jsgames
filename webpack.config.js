// REMOVE require('@babel/polyfill');
// import "core-js/stable";

const HTMLWebpackPlugin = require('html-webpack-plugin');

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
	template: __dirname + '/src/app/index.html',
	filename: 'index.html',
	inject: 'body',

});

module.exports = {
	mode: 'development',
	entry: [__dirname + '/src/app/index.jsx'],
	output: {
		filename: 'packedjs.js',
		publicPath: '/',
		path: __dirname + '/build/public'
	},
	plugins: [HTMLWebpackPluginConfig],
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
	},
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx' ],
	},
	module: {
		rules: [
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
	}
};