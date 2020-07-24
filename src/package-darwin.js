const fs = require("fs-extra");
const path = require("path");
const appdmg = require("appdmg");

const util = require("./util");
const esy = require("./esy");

const makeDmg = async (spec) => {
  return new Promise((resolve, reject) => {
    console.dir(spec);
    const ee = appdmg(spec);

    ee.on("progress", (info) => {
      if (info.type == "step-begin") {
        console.log("[DMG] " + info.title);
      }
    });

    ee.on("finish", () => {
      resolve();
    });

    ee.on("error", (err) => {
      reject(err);
    });
  });
};

module.exports = async (config) => {
  const appName = config.bundleInfo.bundleName + ".app";

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
    return f != bundleInfo.mainExecutable;
  });

  filesToBeMoved.forEach((file) => {
    console.log("Moving file: " + file);
    const fileSrc = path.join(binaryDirectory, file);
    const fileDest = path.join(resourcesDirectory, file);
    console.log(`Moving file from ${fileSrc} to ${fileDest}.`);
    fs.moveSync(fileSrc, fileDest);
    const symlinkDest = path.join("../Resources", file);
    console.log(`Symlinking ${symlinkDest} -> ${fileSrc}`);
    fs.ensureSymlinkSync(symlinkDest, fileSrc);
  });

  console.log("Bundling dylibs...");

  const executablePath = path.join(binaryDirectory, bundleInfo.mainExecutable);

  // Run the 'dylibbundler' tool
  util.shell(
    `${config.macBundlerPath} -b -x "${executablePath}" -d "${frameworksDirectory}" -p "@executable_path/../Frameworks/" -cd`
  );

  // Bundle into tar package, if specified
  if (config.bundleInfo.packages.indexOf("tar") >= 0) {
    const tarDest = `${config.bundleInfo.bundleName}-darwin.tar.gz`;
    util.shell(
      `cd '${config.platformReleaseDir}' && tar -zcf '../${tarDest}' ${appName}`
    );
    console.log(`** Created tar package: ${tarDest}`);
  }

  // Create DMG package, if specified
  if (config.bundleInfo.packages.indexOf("dmg") >= 0) {
    const dmgTarget = config.bundleInfo.bundleName + ".dmg";
    const spec = {
      target: path.join(config.releaseDir, dmgTarget),
      basepath: config.platformReleaseDir,
      specification: {
        title: config.bundleInfo.displayName,
        background: config.bundleInfo.dmgBackground,
        format: "ULFO",
        window: {
          size: {
            width: 660,
            height: 400,
          },
        },
        contents: [
          {
            x: 180,
            y: 170,
            type: "file",
            path: appDirectory,
          },
          {
            x: 480,
            y: 170,
            type: "link",
            path: "/Applications",
          },
        ],
      },
    };

    await makeDmg(spec);
    console.log("** Created DMG: " + dmgTarget);
  }

  console.log("OSX packaging complete!");
};
