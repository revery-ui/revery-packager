// Bundle.js
//
// Utilities for reading the bundle information from package json

const fs = require("fs-extra");

const defaultBundleInfo = {
  // On Mac, this is the name of the app bundle. For example,
  // if bundleName is "ExampleApp", the output App would be "Example.App"
  bundleName: "ReveryApp", 

  // On Mac, this is the bundle id used in the plist
  bundleId: "com.example.revery",

  displayName: "Revery App",

  // Main executable should be the primary executable, WITHOUT the '.exe' extension.
  mainExecutable: "App",

  // Packages - list of package formats to output:
  packages: [],

  // Path to icon file
  // Windows: An .ico file is expected
  // OSX: An .icns file is expected
  iconFile: null,
};

const getBundleInfo = (packageJson) => {

   let platform;
   if (process.platform == "win32") {
      platform = "win32";
   } else if (process.platform == "darwin") {
      platform = "darwin"
   } else {
      platform = "linux"
   }

   let commonBundleInfo = packageJson["revery-packager"] || {};

   let platformBundleInfo = {};

   if (commonBundleInfo[platform]) {
      platformBundleInfo = commonBundleInfo[platform];
   }

   return {
      ...defaultBundleInfo,
      ...commonBundleInfo,
      ...platformBundleInfo
   };
};

module.exports = {
    getBundleInfo
};
