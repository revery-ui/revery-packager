const util = require("./util");
const esy = require("./esy");

module.exports = (config) => {
    console.log("Packaging windows!");

    util.copy(config.binPath, config.platformReleaseDir);
};
