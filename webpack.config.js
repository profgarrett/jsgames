var HTMLWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
	template: __dirname + '/app/index.html',
	filename: 'index.html',
	inject: 'body',

});

module.exports = {
	entry: ['babel-polyfill', __dirname + '/app/index.js'],
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	},
	output: {
		filename: 'transformed.js',
		path:   __dirname + '/build'
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
	}

};
