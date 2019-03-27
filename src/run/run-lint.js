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

const cleanup = (opts = {}) => {
  const cleanupFn = opts.cleanupFn;
  if (typeof cleanupFn === "function") {
    cleanupFn(opts);
  }

  let { failure, success, error, script } = opts;
  script = script || chooseScript(opts);

  const exitFailure = opts.exitFailure || defaults.exitFailure;
  const chooseScript = opts.chooseScript || defaults.chooseScript;

  runScript(script, ({ err }) => {
    if (err || failure) {
      const errorMsg = error || err;
      exitFailure(errorMsg);
    }
    if (success) {
      console.log("SUCCESS");
    }
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

const runLintScript = (lintScript, opts = {}) => {
  const cleanup = opts.cleanup || defaults.cleanup;

  runScript(lintScript, ({ err }) => {
    const opts = err ? { failure: true } : { success: true };
    cleanup(opts);
  });
};

const runInternalEscapeScript = (nodeScript, opts = {}) => {
  processFiles(opts);
};

const prepareAndRunLintScript = (opts = {}) => {
  let { lintFileMatch, debug } = opts;

  lintFileMatch =
    lintFileMatch || path.join(process.cwd(), "**/*.cshtml.lintable");

  if (typeof lintFileMatch !== "string") {
    throw `runLint: Missing or invalid lintFileMatch ${lintFileMatch}`;
  }

  const lintScript = `:eslint ${lintFileMatch}`;
  if (debug) {
    console.log("run", lintScript);
  }

  const runLintScript = opts.runLintScript || defaults.runLintScript;

  runLintScript(lintScript, opts);
};

const runEscapeScript = (nodeScript, opts = {}) => {
  const cleanup = opts.cleanup || defaults.cleanup;

  runScript(nodeScript, ({ err }) => {
    if (err) {
      cleanup({ failure: true, error: err });
    }

    prepareAndRunLintScript(opts);
  });
};

const runLint = (scriptPath, opts = {}) => {
  if (typeof scriptPath !== "string") {
    throw `runLint: Missing or invalid scriptPath ${scriptPath}`;
  }
  const fileSys = opts.fs || fs;

  if (!fileSys.existsSync(scriptPath)) {
    throw `runLint: No such file ${scriptPath} exists in file system`;
  }

  const { debug } = opts;
  const nodeScript = `:node ${scriptPath}`;
  if (debug) {
    console.log("run", nodeScript);
  }

  const onSuccess = (processResult, options) => {
    prepareAndRunLintScript({ processResult, ...options });
  };
  opts.onSuccess = opts.onSuccess || onSuccess;

  const runEscapeScript = opts.runEscapeScript || defaults.runEscapeScript;

  runEscapeScript(nodeScript, opts);
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
