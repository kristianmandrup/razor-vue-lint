const path = require("path");
const fs = require("fs");
const { runScript } = require("./run-script");

const { exitFailure } = require("./util");

const cleanupOpts = { root: ".", fileMatch: "*.lintable" };

const cleanupScripts = {
  windows: ({ fileMatch } = cleanupOpts) => `:del /s /q ${fileMatch}`,
  unix: ({ rootPath, fileMatch } = cleanupOpts) =>
    `:find ${rootPath} -type f -name '${fileMatch}' -delete`
};

const chooseScript = (opts = {}) => {
  const { os } = opts;
  return cleanupScripts[os || "windows"](opts);
};

const isFunction = fun => typeof fun === "function";
const isString = str => typeof str === "string";

const validateFileLocationParam = (method, name, value) => {
  if (!isString(value)) {
    throw `${method}: Missing or invalid ${name} ${value}`;
  }
  if (!fs.existsSync(scriptPath)) {
    throw `${method}: No such file ${value} exists in file system`;
  }
};

const cleanup = (opts = {}) => {
  const cleanupFn = opts.cleanupFn;
  if (isFunction(cleanupFn)) {
    cleanupFn(opts);
  }

  let { failure, success, error, script } = opts;
  const $exitFailure = opts.exitFailure || exitFailure;
  const $chooseScript = opts.chooseScript || chooseScript;
  script = script || $chooseScript(opts);

  runScript(script, ({ err }) => {
    if (err || failure) {
      const errorMsg = error || err;
      $exitFailure(errorMsg);
    }
    if (success) {
      console.log("SUCCESS");
    }
  });
};

const runLintScript = (lintScript, opts = {}) => {
  const $cleanup = opts.cleanup || cleanup;

  runScript(lintScript, ({ err }) => {
    const opts = err ? { failure: true } : { success: true };
    $cleanup(opts);
  });
};

const runInternalEscapeScript = (_, opts = {}) => {
  processFiles(opts);
};

// See: https://eslint.org/docs/user-guide/command-line-interface
const prepareAndRunLintScript = (opts = {}) => {
  let { lintLocation, rootPath, lintArgs, lintExt, debug } = opts;

  lintLocation = lintLocation || rootPath || process.cwd();
  lintExt = lintExt || ".cshtml.lintable";

  if (!isString(lintExt)) {
    throw `runLint: Missing or invalid lintExt ${lintExt}`;
  }

  validateFileLocationParam(
    "prepareAndRunLintScript",
    "lintLocation",
    lintLocation
  );

  const lintScript = `:eslint ${lintArgs} --ext ${lintExt} ${lintLocation}`;
  if (debug) {
    console.log("run", lintScript);
  }

  const $runLintScript = opts.runLintScript || runLintScript;

  $runLintScript(lintScript, opts);
};

const runEscapeScript = (nodeScript, opts = {}) => {
  const $cleanup = opts.cleanup || cleanup;
  const $prepareAndRunLintScript =
    opts.prepareAndRunLintScript || prepareAndRunLintScript;

  runScript(nodeScript, ({ err }) => {
    if (err) {
      $cleanup({ failure: true, error: err });
    }

    $prepareAndRunLintScript(opts);
  });
};

const defaults = {
  cleanup,
  cleanupOpts,
  cleanupScripts,
  exitFailure,
  runEscapeScript,
  runInternalEscapeScript,
  prepareAndRunLintScript,
  runLintScript
};

const runLint = (scriptPath, opts = {}) => {
  validateFileLocationParam("runLint", "scriptPath", scriptPath);

  const { debug } = opts;
  const nodeScript = `:node ${scriptPath}`;
  if (debug) {
    console.log("run", nodeScript);
  }

  const onSuccess = (processed, options) => {
    prepareAndRunLintScript({ processed, ...options });
  };
  opts.onSuccess = opts.onSuccess || onSuccess;

  const $runEscapeScript = opts.runEscapeScript || runEscapeScript;

  $runEscapeScript(nodeScript, opts);
};

module.exports = {
  runLint,
  runLintScript,
  runEscapeScript,
  runScript,
  cleanup,
  exitFailure,
  defaults,
  chooseScript
};
