const fs = require("fs-extra");
const path = require("path");

const util = require("./util");
const esy = require("./esy");

module.exports = (config) => {
    const appName = config.bundleInfo.bundleName + ".App";
    
    console.log("Packaging for OSX: " + appName);
    
    // The MacOS app folder structure looks like this:
    // - MyApp.App
    //   - Contents
    //     - Resources (non-executable resources)
    //     - MacOS (executable reosurces)
    //     - Frameworks (library code)

    const appDirectory = path.join(config.platformReleaseDir, appName);
    const contentsDirectory = path.join(appDirectory, "Contents");
    const resourcesDirectory = path.join(contentsDirectory, "Resources");
    const binaryDirectory = path.join(contentsDirectory, "MacOS");
    const frameworksDirectory = path.join(contentsDirectory, "Frameworks");

    const plistFile = path.join(contentsDirectory, "Info.plist");

    fs.mkdirpSync(frameworksDirectory);
    fs.mkdirpSync(resourcesDirectory);

    const bundleInfo = config.bundleInfo;

    // Create an Info.plist file for the app
    const plistContents = {
      CFBundleName: bundleInfo.bundleName,
      CFBundleDisplayName: bundleInfo.displayName,
      CFBundleIdentifier: bundleInfo.bundleId,
      CFBundleIconFile: bundleInfo.iconFile,
      CFBundleVersion: config.packageInfo.version,
      CFBundlePackageType: "APPL",
      CFBundleSignature: "????",
      CFBundleExecutable: bundleInfo.mainExecutable,
      NSHighResolutionCapable: true,
    };

    fs.writeFileSync(plistFile, require("plist").build(plistContents));

    // Copy the bin folder over
    util.copy(config.binPath, binaryDirectory);

    // ...but move non-executables from the bin folder to the resources folder,
    // but symlink in, so that the executables can pretend they are available

    const filesToBeMoved = fs.readdirSync(binaryDirectory).filter((f) => {
        return f != bundleInfo.primaryExecutable;
    });

    filesToBeMoved.forEach((file) => {
      console.log("Moving file: " + file);
      const fileSrc = path.join(binaryDirectory, file);
      const fileDest = path.join(resourcesDirectory, file);
      console.log(`Moving file from ${fileSrc} to ${fileDest}.`);
      fs.moveSync(fileSrc, fileDest);
      const symlinkDest = path.join("../Resources", file);
      console.log(`Symlinking ${symlinkDest} -> ${fileSrc}`);
      fs.ensureSymlink(symlinkDest, fileSrc);
    });

    console.log("Bundling dylibs...");

    // Run the 'dylibbundler' tool
    util.shell(`${config.macBundlerPath} -b -x "${path.join(binaryDirectory, 
        bundleInfo.primaryExecutable)}" -d "${frameworksDirectory}" -p "@executable_path/../Frameworks/" -cd`);

    // TODO:
    // - Tar package
    // - DMG package
    console.log("OSX packaging complete!");
};
