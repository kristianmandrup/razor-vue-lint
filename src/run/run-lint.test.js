const { runLint } = require("./run-lint");

describe("runLint", () => {
  describe("definition", () => {
    const type = typeof runLint;
    test("is a function", () => {
      expect(type === "function").toBeTruthy();
    });
  });

  describe("call", () => {
    test("no args - throws", () => {
      expect(() => runLint()).toThrow();
    });

    test("Non-existing node.js file - throws", () => {
      expect(() => runLint("unknown", { debug: true })).toThrow();
    });
  });
});
