# revery-packager

Utility inspired by [electron-builder](https://github.com/electron-userland/electron-builder) for bundling [Revery](https://outrunlabs.com/revery) applications into installable application packages.

This is extracted out from the [Onivim 2](https://v2.onivim.io) packaging scripts, and provides a way to get redistributable executables from your Revery projects.

This packager takes care of some of the heavy lifting, like:

- __Windows:__ Bringing in the proper set of runtime DLL dependencies
- __OS X:__ Bundling `dylibs` and remapping `rpath`s to be relocatable
- __Linux:__ Bundling `so` libs and remapping `rpath`'s to be relocatable.

...but you don't have to worry about that - you can just run `revery-packager` and be good to go.

## Installation

```
npm install -g revery-packager`
```

## Usage

1) Ensure your Revery project is built and up-to-date (`esy install`, `esy build`).
2) Run `revery-packager` at the root of your Revery project.

You'll find the release artifacts for the current platform in the `_release` folder.

> __NOTE:__ Today, `revery-packager` doesn't support 'cross-platform' packaging - meaning you need to run `revery-packager` on each platform you want to distribute builds. We recommend [Azure Devops CI](https://devops.azure.com) as a way build and get packages for all platforms - see our [revery-quick-start  pipeline](https://github.com/revery-ui/revery-quick-start/blob/master/azure-pipelines.yml) for an example.

## Configuration

You can customize the behavior of the packager by adding a `revery-packager` section to your `package.json`, like:

__package.json__
```json
  "name": "revery-quick-start",
  "version": "1.3.0",
  "description": "Revery quickstart",
  "license": "MIT",
  "esy": {
    "build": "refmterr dune build -p App",
    "buildsInSource": "_build"
  },
  "revery-packager": {
    "bundleName": "ExampleApp",
    "bundleId": "com.example.app",
    "displayName": "Revery Example App",
    "mainExecutable": "App",
    "windows": {
      "packages": ["zip"],
      "iconFile": "assets/icon.ico"
    },
    "darwin": {
      "packages": ["tar", "dmg"],
      "iconFile": "assets/icon.icns"
    },
    "linux": {
      "packages": ["tar", "appimage"]
    }
  },
  ...
```

The following properties are configurable:

- __`bundleName`__ - The bundle name of the application. Used for manifests and for the filename.
- __`bundleId`__ - An identifier for the application. Used as the `CFBundleIdentifier` for Mac.
- __`displayName`__ - Display name of the application, used for installers, desktop entries, etc.
- __`mainExecutable`__ - The entry point for the application. There should be no `.exe` suffix added.
- __`packages`__ - per-platform list of packages to build:
- __`dmgBackground`__ - __MAC-ONLY__ - background to use for DMG installer
- __`appImageType`__ - __LINUX-ONLY__ - type to use in the desktop entry for the AppImage
- __`appImageCategory`__ - __LINUX_ONLY__ - category to use for the desktop entry for the AppImage
- __`iconFile`__ 
  - __Windows__ - an `.ico` file to use for the executable
  - __Linux__ - a `.png` file to use the desktop entry
  - __Mac__ - an `.icns` file to use for the app icon

You can also specify per-platform settings by using the `windows`, `darwin`, and `linux` sections - you probably want to do this for settings like `iconFile`.

## Roadmap

- Windows
  - [ ] Code signing
  - [x] `zip` package
  - [ ] `exe` installer
  - [ ] `msi` installer
- OSX
  - [ ] Code signing
  - [ ] Notarization
  - [x] `tar` package
  - [x] `dmg` package
- Linux
  - [ ] GPG signature
  - [x] `tar` package
  - [x] `appimage` package

## License

[MIT License](./LICENSE)

Copyright 2019 Outrun Labs, LLC



