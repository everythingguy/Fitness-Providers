/* eslint-disable @typescript-eslint/no-var-requires */
const tailwindcss = require("tailwindcss");

module.exports = {
    plugins: [
        tailwindcss("./tailwind-src/tailwind.js"),
        require("autoprefixer")
    ]
};