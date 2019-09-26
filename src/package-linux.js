const fs = require("fs-extra");
const os = require("os");
const path = require("path");

const util = require("./util");
const esy = require("./esy");

const desktopFile = (bundleInfo) =>
`[Desktop Entry]
Name=${bundleInfo.bundleName}
Exec=${bundleInfo.mainExecutable}
Icon=Icon
Type=${bundleInfo.appImageType}
Categories=${bundleInfo.appImageCategory}
`;

const appRun = (bundleInfo) => {
    const HERE = "${HERE}";
    return `#!/bin/sh
    HERE=$(dirname $(readlink -f "${0}"))
    export PATH="${HERE}/usr/bin:$PATH"
    export LD_LIBRARY_PATH="${HERE}/usr/lib/:$LD_LIBRARY_PATH"
    ${HERE}/usr/bin/${bundleInfo.mainExecutable} $@
    `;
}

module.exports = async (config) => {
    console.log("Packaging for linux.");
    
    // Create a temp folder so that we can download some extra tools:
    // linuxdeploy
    // appimagetool

    const tempFolder = path.join(os.tmpdir(), "revery-packager");
    fs.mkdirpSync(tempFolder);
    
    const linuxDeployAppImagePath = path.join(tempFolder, "linuxdeploy-x86_64.AppImage");

    console.log(" - Installing linuxdeploy...");
    util.shell(`wget -O '${linuxDeployAppImagePath}' https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage`);
    util.shell(`chmod +x '${linuxDeployAppImagePath}'`);
    
    console.log(" - Installing appimagetool...");
    const appImageToolPath = path.join(tempFolder, "appimagetool-x86_64.AppImage");

    const appDirName = config.bundleInfo.bundleName + ".AppDir";
    const appDirFolder = path.join(config.platformReleaseDir, appDirName);

    const binFolder = path.join(appDirFolder, "usr", "bin");

    // Create a temporary staging folder
    const staging = path.join(os.tmpdir(), "revery-packager-staging" + new Date().getTime().toString());

    const stagingBin = path.join(staging, "bin");
    fs.mkdirpSync(stagingBin);
    
    // Copy binaries to staging, and run linux deploy
    util.copy(config.binPath, stagingBin);

    // Create desktop and app run files
    const appRunStagingPath = path.join(staging, "AppRun");
    const desktopFileName = config.bundleInfo.bundleName + ".desktop";
    const desktopStagingPath = path.join(staging, desktopFileName)
    fs.writeFileSync(appRunStagingPath, appRun(config.bundleInfo), "utf8");
    fs.writeFileSync(desktopStagingPath, desktopFile(config.bundleInfo), "utf8");

    const iconFilePath = path.join(staging, "Icon.png");
    util.copy(config.bundleInfo.iconFile, iconFilePath);

    util.copy(appRunStagingPath, path.join(appDirFolder, "AppRun"));
    util.shell(`chmod +x '${path.join(appDirFolder, "AppRun")}'`);

    fs.mkdirpSync(appDirFolder);
    fs.mkdirpSync(binFolder);
    
    const mainBinaryPath = path.join(stagingBin, config.bundleInfo.mainExecutable);
    util.copy(stagingBin, binFolder);
    // Run linuxdeploy on the app image binaries
    util.shell(`${linuxDeployAppImagePath} -e '${mainBinaryPath}' --appdir '${appDirFolder}' -d '${desktopStagingPath}' -i '${iconFilePath}'`);

    console.log("**Created app folder: " + appDirFolder);

    // Create tar
    if(config.bundleInfo.packages.indexOf("tar") >= 0) {
      const tarDest = `${config.bundleInfo.bundleName}-linux.tar.gz`;
      util.shell(`cd '${config.platformReleaseDir}' && tar -zcf '../${tarDest}' ${appDirName}`);
      console.log(`** Created tar package: ${tarDest}`);
    }

    // Create app image
    if(config.bundleInfo.packages.indexOf("appimage") >= 0) {
      const appImageDest = path.join(config.releaseDir, `${config.bundleInfo.appName}-x86_64.AppImage`);
      util.shell(`ARCH=x86_64 ${appImageToolPath} '${appDirFolder}' '${appImageDest}'`);
      console.log(`** Created appImage: ${appImageDest}`);
    }

    // Clean up
    fs.removeSync(tempFolder);
};
