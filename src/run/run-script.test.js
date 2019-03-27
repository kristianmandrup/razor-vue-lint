const { runScript } = require("./run-script");

describe("runScript", () => {
  describe("definition", () => {
    test("is a function", () => {
      expect(typeof runScript === "function").toBeTruthy();
    });
  });
});
