const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Local build timestamp, YYYYMMDD-HHMMSS. Embedded in the bundle filename so a
// deployed build can be dated at a glance without opening meta.json.
const BUILD_DT = (() => {
	const d = new Date();
	const p = n => String(n).padStart(2, '0');
	return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
})();

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
		minimize: true,
		minimizer: [new TerserPlugin({
			parallel: true,
			terserOptions: {
				format: { comments: false }
			},
			extractComments: false
		})]
	},

	output: {
		filename: `[name].${BUILD_DT}.[chunkhash].js`,
		sourceMapFilename: `[name].${BUILD_DT}.[chunkhash].js.map`,
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
