const tailwindcss = require("tailwindcss");

module.exports = {
    plugins: [
        tailwindcss("./tailwind-src/tailwind.js"),
        require("autoprefixer")
    ]
};