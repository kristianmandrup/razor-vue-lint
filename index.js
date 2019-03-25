const { replaceAll } = require("./src/eslint-escape-razor-exprs");
const traverse = require("./src/traverse");
module.exports = {
  default: replaceAll,
  addIgnoreEsLintBlocksForRazorExpressions: replaceAll,
  traverse
};
