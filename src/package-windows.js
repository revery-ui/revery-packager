const fs = require("fs-extra");
const path = require("path");

const util = require("./util");
const esy = require("./esy");

module.exports = (config) => {
    console.log("Packaging for windows.");

    util.copy(config.binPath, config.platformReleaseDir);

    // We need to bring over MingW runtime dlls
    console.log("Copying runtime DLLs");
    const filesToBeMoved = fs.readdirSync(config.reveryBinPath).filter((f) => {
      return path.extname(f) == ".dll";
    });

    filesToBeMoved.forEach((f) => {
        util.copy(path.join(config.reveryBinPath, f), path.join(config.binPath));
    });
};
