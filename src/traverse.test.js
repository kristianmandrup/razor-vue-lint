const fs = require("fs");
const { processFiles, processFile } = require("./traverse");
const restoreFs = () => {};

const csHtmlFile = `@using Olympus.Core.Models.Blocks.Subscription
@model  Olympus.Core.ViewModels.BlockViewModelBase<SubscriptionOfferingsBlock>
<subscription inline-template>`;

const mockFs = () => {
  const MemoryFs = require("metro-memory-fs");
  const folder = "/app";

  jest.mock(
    "fs",
    () =>
      new MemoryFs({
        cwd: folder
      })
  );
};

beforeEach(() => fs.reset()); // optional, cleans up the whole filesystem

const writeFiles = () => {
  fs.writeFileSync("/foo.cshtml", csHtmlFile);
  fs.writeFileSync("/bar.txt", "hello world");

  fs.mkdirSync("/current");
  fs.mkdirSync("/current/working");
  fs.writeFileSync("blap.txt", "test123");
  fs.mkdirSync("/current/working/dir");
  fs.writeFileSync("blip.txt", "test456");
};

describe("traverse", () => {
  // Create an in-memory filesystem.
  beforeEach(() => {
    mockFs();
    writeFiles();
  });
  afterEach(() => {
    restoreFs();
  });

  describe("processFiles", () => {
    describe("folder option", () => {
      test("no folder", () => {
        expect(() => processFiles({})).toThrow();
      });

      test("not existing folder", () => {
        expect(() => processFiles({ folder: "unknown" })).toThrow();
      });

      test("existing folder", () => {
        expect(() => processFiles({ folder, fs })).not.toThrow();
      });
    });
  });
});
