const cp = require("child_process");

const esyCommand = process.platform == "win32" ? "esy.cmd" : "esy";

const runEsyCommand = (workingDirectory, args) => {
    console.log("ESY: Running esy command: " + args.join(" ") + " in " + workingDirectory);

    const result = cp.spawnSync(esyCommand, args, { cwd: workingDirectory, env: process.env});
    if (!result) {
        return null;
    } else if (!result.stdout) {
        return null;
    } else {
        const out = result.stdout.toString("utf-8").trim();
        return out;
    }
};

const getEsyVariable = (workingDirectory, variableName) => {
    return runEsyCommand(workingDirectory, ["echo", "#{" + variableName +"}"]);
};

const isBuilt = (workingDirectory) => {
    const json = runEsyCommand(workingDirectory, ["status"]);
    if (!json) {
        return false;
    }

    return JSON.parse(json).isProjectReadyForDev;
};

const ensureInstalled = (workingDirectory) => {
    runEsyCommand(workingDirectory, ["x", "echo"]);
};

module.exports = {
    ensureInstalled,
    getEsyVariable,
    isBuilt,
};
