/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const NODE_INDEX = Number(process.env.CI_NODE_INDEX || 1);
const NODE_TOTAL = Number(process.env.CI_NODE_TOTAL || 1);
const TEST_FOLDER = './cypress/integration';

// This log will be printed out to the console
// so that cypress will know which files will be run.
// Also, since getSpecFiles returns an array, the paths are
// joined with comma
// eslint-disable-next-line no-console
console.log(getSpecFiles().join(','));

function getSpecFiles() {
    const allSpecFiles = walk(TEST_FOLDER);

    return allSpecFiles.sort()
        .filter((_, index) => (index % NODE_TOTAL) === (NODE_INDEX - 1))
        .filter((s) => !s.toLowerCase().includes("disabled"));
}

function walk(dir) {
    let files = fs.readdirSync(dir);
    files = files.map(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) return walk(filePath);
        else return filePath;
    });

    return files
        .reduce((all, folderContents) => all.concat(folderContents), []);
}