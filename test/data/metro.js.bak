const mockFs = () => {
  jest.mock("fs", () => {
    const MemoryFs = require("metro-memory-fs");
    new MemoryFs({
      cwd: "/app"
    });
  });
};

const resetFs = () => fs.reset();

const writeFiles = () => {
  fs.writeFileSync("/foo.cshtml", csHtmlFile);
  fs.writeFileSync("/bar.txt", "hello world");

  fs.mkdirSync("/current");
  fs.mkdirSync("/current/working");
  fs.writeFileSync("blap.txt", "test123");
  fs.mkdirSync("/current/working/dir");
  fs.writeFileSync("blip.txt", "test456");
};

module.exports = {
  writeFiles,
  mockFs,
  resetFs
};
