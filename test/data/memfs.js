const { fs, vol } = require("memfs");
const { folder, cshtmlFile } = require("./files");

const json = {
  "./README.md": "1",
  "./src/index.cshml": cshtmlFile,
  "./node_modules/debug/index.js": "3"
};

vol.fromJSON(json, folder);

module.exports = { vol, fs };
