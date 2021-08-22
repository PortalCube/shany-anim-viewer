const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "production",
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: "build/index.html",
            filename: "index.html",
            hash: true,
            minify: false
        })
    ]
};
