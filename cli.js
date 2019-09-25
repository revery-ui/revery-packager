#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
console.log("Revery Packager v" + require("./package.json").version);

const args = require("yargs")
    .argv;

let projectDir = process.cwd();

if (args.project) {
    projectDir = args.project;
}

console.log(" - Packaging project: " + projectDir);

const releaseDir = path.join(projectDir, "_release");
const platformReleaseDir = path.join(releaseDir, process.platform);

console.log(" - Placing release artifacts in: " + platformReleaseDir);

const packageJsonPath = path.join(projectDir, "package.json");

if (!fs.existsSync(packageJsonPath)) {
    throw "No package.json found at: " + packageJsonPath;
};

const packageInfo = require(packageJsonPath);

console.log(" - Checking esy status...");

const esy = require("./src/esy");

const isBuilt = esy.isBuilt(projectDir);

if (!isBuilt) {
    throw "Esy project must be built prior to packaging.";
}

console.log (" - Esy isBuilt: true");

const workingDirectory = projectDir;
const binPath = esy.getEsyVariable(workingDirectory, "self.bin");
const reveryBinPath = esy.getEsyVariable(workingDirectory, "revery.bin");

console.log(" - Project bin path: " + binPath);
console.log(" - Revery bin path: " + reveryBinPath);


let macBundlerPath = null;
if (process.platform == "darwin") {
    let macBundlerDir = esy.getEsyVariable(workingDirectory, "esy-macdylibbundler.bin");
    macBundlerPath = path.join(macBundlerDir, "dylibbundler");

    // TODO: Can we do something better, like bundle esy-dylibbundler with this project?
    if (!fs.existsSync(macBundlerPath)) {
        throw "esy-macdylibbundler must be a dependency of the project.";
    }
    console.log(" - Mac bundler path: " + macBundlerPath);
}

console.log("Created _release directory");
fs.removeSync(platformReleaseDir);
fs.mkdirpSync(platformReleaseDir);

esy.ensureInstalled(workingDirectory);

const bundleInfo = require("./src/bundle").getBundleInfo(packageInfo);

const config = {
    projectDir,
    releaseDir,
    platformReleaseDir,
    bundleInfo,
    packageInfo,
    binPath,
    reveryBinPath,
    macBundlerPath,
};

const run = async () => {

    if (process.platform == "win32") {
        await require("./src/package-windows")(config);
    } else if (process.platform == "darwin") {
        await require("./src/package-darwin")(config);
    } else {
        await require("./src/package-linux")(config);
    }
};

run();
