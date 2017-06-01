import * as fs from "fs";

import _libflifem = require("./flif.js")

let notifyReady: () => void;
const tillReady = new Promise<void>(resolve => notifyReady = resolve);
const libflifem = _libflifem({ wasmBinaryFile: __dirname + "/flif.wasm", onRuntimeInitialized: notifyReady });

async function main() {
    await tillReady;

    mount();

    const convertedArgv = convertArgv();

    libflifem.callMain(convertedArgv.slice(2))
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
}

function convertArgv() {
    // TODO: implement
    return process.argv;
}