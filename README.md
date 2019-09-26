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

You'll find the release artifacts at the `_release` folder.

## Configuration

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



