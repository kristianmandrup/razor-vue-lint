const mock = require("mock-fs");
const { folder, cshtmlFile } = require("./files");

const mockFileSystem = () => {
  mock({
    [folder]: {
      "some-file.cshtml": cshtmlFile,
      "empty-dir": {
        /** empty directory */
      }
    }
  });
};

module.exports = {
  mockFileSystem
};
