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
  let { failure, success, error, script, os } = opts;

  const exitFailure = opts.exitFailure || defaults.exitFailure;
  const chooseScript = opts.chooseScript || defaults.chooseScript;

  script = script || chooseScript(opts);

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
  exitFailure
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
  const cleanup = opts.cleanup || defaults.cleanup;
  const nodeScript = `:node ${scriptPath}`;
  if (debug) {
    console.log("run", nodeScript);
  }

  runScript(nodeScript, ({ err }) => {
    if (err) {
      cleanup({ failure: true, error: err });
    }

    let { lintFileMatch } = opts;

    lintFileMatch =
      lintFileMatch || path.join(process.cwd(), "**/*.cshtml.lintable");

    if (typeof lintFileMatch !== "string") {
      throw `runLint: Missing or invalid lintFileMatch ${lintFileMatch}`;
    }

    const lintScript = `:eslint ${lintFileMatch}`;
    if (debug) {
      console.log("run", lintScript);
    }

    runScript(lintScript, ({ err }) => {
      const opts = err ? { failure: true } : { success: true };
      cleanup(opts);
    });
  });
};

module.exports = {
  runLint,
  runScript,
  cleanup,
  exitFailure,
  defaults,
  chooseScript
};
