/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-unused-vars */
const webpack = require("webpack");
const path = require("path");
const dotenv = require("dotenv");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const BundleTracker = require("webpack-bundle-tracker");
const {
  CleanWebpackPlugin
} = require("clean-webpack-plugin");

module.exports = () => {
  dotenv.config({
    path: path.resolve(__dirname, "../.env"),
    override: false
  }).parsed;

  return {
    entry: "./src/index.tsx",
    devtool: "source-map",
    target: "web",
    watchOptions: {
      aggregateTimeout: 200,
      poll: 1000,
    },
    output: {
      path: path.resolve("../public/dist"),
      filename: "bundle.js"
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    plugins: [
      // new BundleAnalyzerPlugin(),
      new webpack.DefinePlugin({
        "process.env.API_URL": JSON.stringify(process.env.API_URL),
        "process.env.MAIL_CONTACT_EMAIL": JSON.stringify(process.env.MAIL_CONTACT_EMAIL),
        "process.env.GOOGLE_MAP_API": JSON.stringify(process.env.GOOGLE_MAP_API),
        "process.env.PAYPAL_CLIENT_ID": JSON.stringify(process.env.PAYPAL_CLIENT_ID),
        "process.env.PAYPAL_PLAN_ID": JSON.stringify(process.env.PAYPAL_PLAN_ID),
        "process.env.DEMO": JSON.stringify(process.env.DEMO)
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
            if (((path.endsWith(".ts") && !path.endsWith(".test.ts")) ||
                path.endsWith(".tsx") || path.endsWith(".js") || path.endsWith(".jsx"))) {
              return true;
            }
            return false;
          },
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader",
            {
              loader: "css-loader",
              options: {
                url: false
              }
            }
          ],

        },
        {
          test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
          loader: 'file-loader',
        }
      ],
    },
  };
};