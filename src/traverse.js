const recursive = require("recursive-readdir");
const path = require("path");
const fs = require("fs");
const { replaceAll } = require("./eslint-escape-razor-exprs");

const fileExtOf = filePath => path.extname(filePath).slice(1);

const readFile = (filePath, opts = {}) => {
  const fs = opts.fs || fs;
  fs.readFileSync(filePath);
};

const writeFile = (filePath, data, opts = {}) => {
  const fs = opts.fs || fs;
  fs.writeFileSync(filePath, data);
};

const processFile = (filePath, opts) => {
  const readFile = opts.readFile || readFile;
  const writeFile = opts.writeFile || writeFile;
  const destFilePathOf = opts.destFilePathOf;
  const destFilePath = destFilePathOf ? destFilePathOf(filePath) : filePath;
  const fileContent = readFile(filePath);
  const content = replaceAll(fileContent);
  let written = false;
  if (opts.write) {
    writeFile(destFilePath, content, opts);
    written = true;
  }
  return {
    filePath,
    content,
    written
  };
};

const filesProcessor = (files, opts = {}) => {
  return files.map(file => processFile(file, opts));
};

const errorFn = err => {
  console.error(err);
  throw err;
};

const defaults = {
  filesProcessor,
  readFile,
  writeFile,
  errorFn
};

const onlyExt = fileExt => file => fileExtOf(file) === fileExt;

const printResult = result => console.log(result);

const successFn = opts => {
  const fileExt = opts.fileExt || "cshtml";
  const filterFn = opts.fileFilter || onlyExt(fileExt);
  const cb = opts.cb || opts.onSuccess || printResult;
  const filesProcessor = opts.filesProcessor || opts.defaults.filesProcessor;
  return files => {
    const matchingFiles = files.filter(filterFn);
    const processResult = filesProcessor(matchingFiles, opts);
    cb && cb(processResult);
  };
};

const processFiles = (opts = {}) => {
  const errorFn = opts.errorFn || defaults.errorFn;
  const folder = opts.folder;
  const fs = opts.fs || fs;

  opts.fs = fs;
  opts.defaults = opts.defaults || defaults;

  if (!fs.existsSync(folder)) {
    throw `The folder: ${folder} does not exist`;
  }
  recursive(folder, opts).then(successFn(opts), errorFn);
};

module.exports = {
  processFiles,
  defaults,
  processFile
};
