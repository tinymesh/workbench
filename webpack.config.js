module.exports = {
    entry: "./src/app.js",
	output: {
		path: "./build",
		publicPath: "/build/",
		filename: "dist.js"
	},
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
				{ test: /\.html$/, loader: "html" },
				{ test: /\.vue$/, loader: "vue" }
        ]
    }
};
