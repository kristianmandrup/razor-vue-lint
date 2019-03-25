const { processFiles, processFile } = require("./traverse");

describe("traverse", () => {
  describe("processFiles", () => {
    test("no folder", () => {
      expect(() => processFiles({})).toThrow();
    });
  });
});
