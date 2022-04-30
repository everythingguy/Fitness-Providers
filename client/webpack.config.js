/* eslint-disable no-unused-vars */
const webpack = require("webpack");
const path = require("path");
const dotenv = require("dotenv");
const BundleTracker = require("webpack-bundle-tracker");
const {
  CleanWebpackPlugin
} = require("clean-webpack-plugin");

module.exports = () => {
  const env = dotenv.config({
    path: path.resolve(__dirname, "../.env")
  }).parsed;

  return {
    entry: "./src/index.tsx",
    devtool: "source-map",
    target: "node",
    output: {
      path: path.resolve("../public/dist"),
      filename: "bundle.js"
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.BASE_URL": JSON.stringify(env.BASE_URL),
        "process.env.BASE_API_URL": JSON.stringify(env.BASE_API_URL),
        "process.env.API_URL": JSON.stringify(env.API_URL)
      }),
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ["./dist/**", "../public/dist/**"],
        cleanAfterEveryBuildPatterns: ['*.LICENSE.txt'],
      }),
      new BundleTracker({
        path: __dirname,
        filename: "./webpack-stats.json",
      })
    ],
    module: {
      rules: [{
          test: (path) => {
            return (path.endsWith(".ts") && !path.endsWith(".test.ts")) ||
              path.endsWith(".tsx") || path.endsWith(".js") || path.endsWith(".jsx");
          },
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
  };
};