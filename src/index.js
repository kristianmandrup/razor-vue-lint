const { replaceAll } = require("./eslint-escape-razor-exprs");
const traverse = require("./traverse");
const { runScript, runLint } = require("./run");
module.exports = {
  default: replaceAll,
  esLintEscapeRazorExpressions: replaceAll,
  traverse,
  runScript,
  runLint
};
