const { replaceAll } = require("./src/eslint-escape-razor-exprs");
const traverse = require("./src/traverse");
const { runScript } = require("./src/run-script");
module.exports = {
  default: replaceAll,
  addIgnoreEsLintBlocksForRazorExpressions: replaceAll,
  traverse,
  runScript
};
