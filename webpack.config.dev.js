const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    devServer: {
        port: 3000,
        allowedHosts: "all"
    },
    devtool: "inline-source-map",
    plugins: [
        new HTMLWebpackPlugin({
            template: "build/index.html",
            filename: "index.html"
        })
    ]
};
