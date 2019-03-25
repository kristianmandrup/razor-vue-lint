const { processFiles, processFile } = require("./traverse");

const { createFsFromVolume } = require("memfs");

const { folder } = require("../test/data/files");
const { fs, mockFs } = require("../test/data/memfs");

const $fileSys = fs;
let volume;

const restoreFs = () => {
  volume.reset();
};

describe("traverse", () => {
  // Create an in-memory filesystem.
  beforeEach(() => {
    // console.log("before Each");
    volume = mockFs({ folder });
    // $fileSys = fs;
    // console.log("fileSys mocked");
    // $fileSys = createFsFromVolume(volume);
  });

  afterEach(() => {
    restoreFs();
  });

  const noop = () => {};
  const onSuccess = noop;

  describe("processFiles", () => {
    describe("folder option", () => {
      test("no folder", () => {
        expect(() => processFiles({})).toThrow();
      });

      test("not existing folder", () => {
        expect(() => processFiles({ folder: "unknown" })).toThrow();
      });

      test("existing folder", () => {
        expect(() => {
          processFiles({
            folder,
            debug: false,
            fs: $fileSys,
            fakeFs: true,
            onSuccess
          });
        }).not.toThrow();
      });
    });

    describe("existing folder", () => {
      test("processed result", done => {
        const onSuccess = (result, opts) => {
          // console.log({ result, opts });
          const written = result[0];
          expect(written.filePath).toEqual("/app/src/index.cshtml");
          expect(written.content).toMatch(/eslint-disable/);
          expect(written.content).toMatch(/eslint-enable/);
          done();
        };

        // if ($fileSys.existsSync(folder)) {
        //   console.log(
        //     "TESTING: mocked",
        //     { folder },
        //     "created. confirm exists on fs"
        //   );
        // }

        processFiles({
          folder,
          debug: false,
          fs: $fileSys,
          fakeFs: true,
          onSuccess
        });
      });
    });
  });
});
