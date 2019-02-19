require('@babel/polyfill');


var HTMLWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
	template: __dirname + '/src/app/index.html',
	filename: 'index.html',
	inject: 'body',

});

module.exports = {
	mode: 'development',
	entry: ['@babel/polyfill', __dirname + '/src/app/index.js'],
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
	output: {
		filename: 'packedjs.js',
		publicPath: '/',
		path:   __dirname + '/build/public'
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
