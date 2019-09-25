const fs = require("fs-extra");

const copy = (source, dest) => {
    console.log(`Copying from ${source} to ${dest}`);
     if (process.platform == "darwin") {
        shell(`cp -r "${source}" "${dest}"`)
     } else {
        fs.copySync(source, dest, {dereference: true});
     }
    console.log("Successfully copied.");
};

module.exports = {
    copy,
};
