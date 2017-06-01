import * as fs from "fs";
import * as path from "path";

import _libflifem = require("./flif.js")

let notifyReady: () => void;
const tillReady = new Promise<void>(resolve => notifyReady = resolve);
const libflifem = _libflifem({ wasmBinaryFile: __dirname + "/flif.wasm", onRuntimeInitialized: notifyReady });

async function main() {
    await tillReady;

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
}

function convertArgv() {
    return process.argv.map((value, index) => {
        if (index < 2 || value.startsWith("-")) {
            return value;
        }
        const input = path.isAbsolute(value) ? value : path.join(process.cwd(), value);

        const match = input.match(/^([a-zA-z]):[/\\]/)
        if (match) {
            return path.join(`/mnt/${match[1].toLowerCase()}/`, input.slice(3)).replace(/\\/g, "/");
        }
        else {
            return path.join("/mnt/", input);
        }
    });
}