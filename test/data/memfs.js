const { fs, vol } = require("memfs");
const { folder, cshtmlFile } = require("./files");

const defaults = {
  vol,
  folder,
  fs,
  fileMap: {
    "./README.md": "# hello",
    "./src/index.cshtml": cshtmlFile
  }
};

const mockFs = (opts = {}) => {
  const fileMap = opts.fileMap || defaults.fileMap;
  const folder = opts.folder || defaults.folder;
  const vol = opts.vol || defaults.vol;
  // console.log("mockFs", { fileMap, folder });
  vol.fromJSON(fileMap, folder);

  // if (fs.existsSync(folder)) {
  //   console.log("mocked", { folder }, "created. confirm exists on fs");
  // }
  return vol;
};

module.exports = { defaults, mockFs, fs, vol };
