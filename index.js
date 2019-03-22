const { replaceAll } = require("./src/eslint-escape-razor-exprs");
module.exports = {
  default: replaceAll,
  addIgnoreEsLintBlocksForRazorExpressions: replaceAll
};
