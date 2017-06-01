const glob = require("glob");
const fs = require("fs");

const cxx = "em++";
const exportName = "-s EXPORT_NAME='_libflifem' -s MODULARIZE=1";
const ports = "-s USE_LIBPNG=1 -s USE_ZLIB=1";
const bind = "--bind wrapper/bind.cpp";
const optimizations = "-D NDEBUG -O2 -ftree-vectorize";
const flags = "-D LODEPNG_NO_COMPILE_PNG -D LODEPNG_NO_COMPILE_DISK";
const commandMisc = `-s ALLOW_MEMORY_GROWTH=1 -s EXTRA_EXPORTED_RUNTIME_METHODS=['FS'] -s WASM=1`;

const libraryInclude = `-I ${appendDir("library/")}`

// copied file list on the upstream makefile
// JSON.stringify((list).split(" "), null, 4)
const filesH = [
    ...glob.sync("maniac/*.hpp"),
    ...glob.sync("maniac/*.cpp"),
    ...glob.sync("image/*.hpp"),
    ...glob.sync("transform/*.hpp"),
    "flif-enc.hpp",
    "flif-dec.hpp",
    "common.hpp",
    "flif_config.h",
    "fileio.hpp",
    "io.hpp",
    "io.cpp",
    "config.h",
    "compiler-specific.hpp",
    "../extern/lodepng.h"
].map(item => appendDir(item)).join(' ');
const filesCpp = [
    "maniac/chance.cpp",
    "maniac/symbol.cpp",
    "image/crc32k.cpp",
    "image/image.cpp",
    "image/image-png.cpp",
    "image/image-pnm.cpp",
    "image/image-pam.cpp",
    "image/image-rggb.cpp",
    "image/image-metadata.cpp",
    "image/color_range.cpp",
    "transform/factory.cpp",
    "common.cpp",
    "flif-enc.cpp",
    "flif-dec.cpp",
    "io.cpp",
    "../extern/lodepng.cpp"
].map(item => appendDir(item)).join(' ');

function appendDir(path) {
    return `submodules/flif/src/${path}`;
}

const jakeExecOptionBag = {
    printStdout: true,
    printStderr: true
};

function asyncExec(cmds) {
    return new Promise((resolve, reject) => {
        try {
            jake.exec(cmds, () => resolve(), jakeExecOptionBag)
        }
        catch (e) {
            reject(e);
        }
    });
}

desc("Build FLIF command-line encoding/decoding tool");
task("commandline", async () => {
    const command = `${cxx} ${flags} -s INVOKE_RUN=0 ${commandMisc} -std=c++11 ${exportName} ${ports} ${optimizations} -g0 -Wall ${filesCpp} ${appendDir("flif.cpp")} -o built/flif.js`;
    console.log(command);
    await asyncExec([command]);
});

desc("Build wrapper for FLIF command-line tool");
task("wrapper", async () => {
    const command = "tsc";
    console.log(command);
    await asyncExec([command]);
});

desc("Builds libflif.js");
task("default", ["commandline", "wrapper"], () => {

});