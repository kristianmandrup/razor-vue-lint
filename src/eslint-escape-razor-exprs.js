const replaceAmp = expr => expr.replace(/@([\(|\w+)])/, "@:$1");

const wrapEnableDisable = txt =>
  `/* eslint-disable */\n${txt}/* eslint-enable */`;

const replaceInLine = txt => {
  return txt.replace(matchers.line.expr, matched => {
    const expr = replaceAmp(matched);
    return wrapEnableDisable(expr) + `\n`;
  });
};

const replaceInTag = txt =>
  txt.replace(matchers.tag.expr, matched => {
    const before = matched.replace(/<\//, "");
    const expr = replaceAmp(before);
    return wrapEnableDisable(expr) + "</";
  }); ////")

const replaceInAttribute = txt =>
  txt.replace(matchers.attribute.expr, matched => {
    const before = matched.replace(/'/g, "");
    let expr = replaceAmp(before);
    return `'` + wrapEnableDisable(expr) + `'`;
  }); ////")

const matchText = (expr, text) => {
  if (expr === "") return null;
  return text.match(expr);
};

const matchers = {
  line: {
    expr: /@[^:]+(\n)/gm,
    replace: replaceInLine
  },
  tag: {
    expr: /@[^:]+(<\/)/gm,
    replace: replaceInTag
  },
  attribute: {
    expr: /('\s*)@[^:]+(')/gm,
    replace: replaceInAttribute
  }
};

const matcherKeys = ["attribute", "tag", "line"];

// const keysOf = Object.keys;

const replaceTxtLine = txt => {
  if (txt.substring(txt.length - 1) != "\n") {
    txt = txt + "\n";
  }
  const replaced = matcherKeys.reduce(
    (acc, key) => {
      const accTxt = acc.txt;
      const matcher = matchers[key];
      const newTxt = matcher.replace(acc.txt);
      if (newTxt != accTxt && !acc.replaced) {
        // console.log("CHANGED", { key, newTxt, accTxt });
        acc.replacedBy[key] = true;
        acc.replaced = true;
        acc.txt = newTxt;
      }
      return acc;
    },
    { txt, replacedBy: {} }
  );
  replaced.txt = replaced.txt.replace(/@:/, "@");
  return replaced;
};

const wasReplacedByLine = lines => index => lines[index].replacedBy.line;

RegExp.escape = function(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

const eslint = {
  enable: /\/\*\s+eslint-enable\s+\*\//,
  disable: /\/\*\s+eslint-disable\s+\*\//
};

const removeTag = (txt, tag) => txt.replace(eslint[tag], "");
const removeIndexed = lines => tag => index => {
  const lineTxt = lines[index];
  // console.log("removeIndexed", { lineTxt, index, tag });
  if (!lineTxt) return;
  lines[index] = removeTag(lineTxt, tag);
  // console.log({ after: lines[index] });
};

const replaceAll = txt => {
  const lines = txt.split("\n");
  let replacedLines = lines.map(replaceTxtLine);

  const byLine = wasReplacedByLine(replacedLines);
  // console.log({ replacedLines });
  const cleanLines = [];
  replacedLines.map((line, index) => {
    // console.log({ line, index });
    if (index > 0) {
      const currentIsLine = byLine(index);
      const lastWasLine = byLine(index - 1);
      // console.log({ index, currentIsLine, lastWasLine });
      if (lastWasLine && currentIsLine) {
        // console.log("byline", { index });
        const removeEnable = removeIndexed(cleanLines)("enable");
        removeEnable(index - 1);
        if (line.txt) {
          line.txt = removeTag(line.txt, "disable");
        }
      }
      if (lastWasLine && !currentIsLine) {
        line.txt = removeTag(line.txt, "disable");
      }
    }
    cleanLines.push(line.txt);
  }, []);
  // console.log({ cleanLines });

  let replacedTxt = cleanLines.join("\n");
  replacedTxt = replacedTxt.replace(/\n+/g, "\n");
  return replacedTxt.replace(
    /\/*\s+eslint-enable\s+\*\/\s*\/\*\s+eslint-disable\s+\*\//g,
    "eslint-disable */"
  );
};

module.exports = {
  matchText,
  replaceAll,
  matchers
};
