"use strict";
const path = require("path");
const _libflifem = require("./flif.js");

const libflifem = _libflifem({ locateFile: filePath => path.resolve(__dirname, filePath) });

async function main() {
    await new Promise(resolve => libflifem.then(() => resolve()));
    libflifem.callMain(process.argv.slice(2));
}
main();
