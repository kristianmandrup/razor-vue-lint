const recursive = require("recursive-readdir");
const path = require("path");
const $fs = require("fs");
const { replaceAll } = require("./eslint-escape-razor-exprs");

const fileExtOf = filePath => path.extname(filePath).slice(1);

const readFile = (filePath, opts = {}) => {
  const fs = opts.fs || $fs;
  return fs.readFileSync(filePath, "utf8");
};

const writeFile = (filePath, data, opts = {}) => {
  const fs = opts.fs || $fs;
  return fs.writeFileSync(filePath, data, "utf8");
};

const processFile = (filePath, opts) => {
  const $readFile = opts.readFile || readFile;
  const $writeFile = opts.writeFile || writeFile;
  const destFilePathOf = opts.destFilePathOf;
  const destFilePath = destFilePathOf ? destFilePathOf(filePath) : filePath;
  const fileContent = $readFile(filePath, opts);
  // console.log({ filePath, fileContent });
  const content = replaceAll(fileContent);
  let written = false;
  if (opts.write) {
    $writeFile(destFilePath, content, opts);
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

const onlyExt = fileExt => filePath => {
  const ext = fileExtOf(filePath);
  return ext === fileExt;
};

const printResult = result => console.log(result);

const createSuccessFn = opts => {
  const defaults = opts.defaults;
  const fileExt = opts.fileExt || "cshtml";
  const filterFn = opts.fileFilter || onlyExt(fileExt);
  const cb = opts.cb || opts.onSuccess || printResult;
  const filesProcessor = opts.filesProcessor || defaults.filesProcessor;

  // console.log({
  //   defaults,
  //   fileExt,
  //   filterFn,
  //   cb,
  //   filesProcessor
  // });

  return files => {
    // console.log({ files });
    const matchingFiles = files.filter(filterFn);
    // console.log({ matchingFiles });
    const processResult = filesProcessor(matchingFiles, opts);
    const $opts = {
      ...opts
    };
    delete $opts.fs;
    cb && cb(processResult, { matched: matchingFiles, ...$opts });
  };
};

const useDefaultFs = () => {
  // console.log("using default FS");
  return $fs;
};

const useCustomFs = fs => {
  // console.log("using custom FS");
  return fs;
};

const processFiles = (opts = {}) => {
  opts.defaults = opts.defaults || defaults;
  const errorFn = opts.errorFn || defaults.errorFn;
  const successFn = opts.successFn || createSuccessFn(opts);
  const folder = opts.folder;
  const fs = opts.fs ? useCustomFs(opts.fs) : useDefaultFs();

  if (!fs.existsSync(folder)) {
    throw `The folder: ${folder} does not exist`;
  }
  opts.fs = fs;
  recursive(folder, opts).then(successFn, errorFn);
};

module.exports = {
  processFiles,
  defaults,
  processFile
};
