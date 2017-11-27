"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const _libflifem = require("./flif.js");
const libflifem = _libflifem({ wasmBinaryFile: __dirname + "/flif.wasm" });
async function main() {
    await new Promise(resolve => libflifem.then(() => resolve()));
    mount();
    const convertedArgv = convertArgv();
    libflifem.callMain(convertedArgv.slice(2));
}
main();
function mount() {
    libflifem.FS.mkdir("/mnt");
    let windows = false;
    for (let c = 'a'.charCodeAt(0); c <= 'z'.charCodeAt(0); c++) {
        const char = String.fromCharCode(c);
        try {
            const drive = `${char}:/`;
            fs.readdirSync(drive);
            // no error occured
            windows = true;
            const driveRoot = `/mnt/${char}`;
            libflifem.FS.mkdir(driveRoot);
            libflifem.FS.mount(libflifem.FS.filesystems.NODEFS, { root: drive }, driveRoot);
        }
        catch (ignore) { }
    }
    if (!windows) {
        libflifem.FS.mount(libflifem.FS.filesystems.NODEFS, { root: "/" }, "/mnt");
    }
    libflifem.FS.currentPath = resolveToVirtual(process.cwd());
}
function convertArgv() {
    return process.argv.map((value, index) => {
        if (index < 2 || value.startsWith("-")) {
            return value;
        }
        if (!path.isAbsolute(value)) {
            return value;
        }
        return resolveToVirtual(value);
    });
}
function resolveToVirtual(absolutePath) {
    const match = absolutePath.match(/^([A-Za-z]):[/\\]/);
    if (match) {
        return path.join(`/mnt/${match[1].toLowerCase()}/`, absolutePath.slice(3)).replace(/\\/g, "/");
    }
    else {
        return path.join("/mnt/", absolutePath);
    }
}
