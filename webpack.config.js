module.exports = {
	module: {
		rules: [
			{
				test: /\.jsx$/,
				use: {
					loader: '@sucrase/webpack-loader',
					options: {
						transforms: ['jsx']
					}
				}
			}
		]
	}
};
