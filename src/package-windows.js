const fs = require("fs-extra");
const path = require("path");
const {zip} = require("zip-a-folder");

const util = require("./util");
const esy = require("./esy");

module.exports = async (config) => {
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

    if(config.bundleInfo.packages.indexOf("zip") >= 0) {
       // Create zip
       const fileName = `${config.bundleInfo.bundleName}-win32-x64.zip`;
       const zipDest = path.join(config.releaseDir, fileName);

       await zip(config.platformReleaseDir, zipDest);

       console.log("** Created zip: " + zipDest);
    };
};
