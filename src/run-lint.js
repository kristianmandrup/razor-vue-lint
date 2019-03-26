const path = require("path");
const { runScript } = require("run-script");

const exitFailure = errorMsg => {
  errorMsg && console.error(errorMsg);
  Process.exit(1);
};

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

  const cleanup = opts.cleanup || defaults.cleanup;

  runScript(`:node ${scriptPath}`, ({ err }) => {
    if (err) {
      cleanup({ failure: true, error: err });
    }

    let { lintFileMatch } = opts;

    lintFileMatch =
      lintFileMatch || path.join(process.cwd(), "**/*.cshtml.lintable");

    if (typeof lintFileMatch !== "string") {
      throw `runLint: Missing or invalid lintFileMatch ${lintFileMatch}`;
    }

    runScript(`:eslint ${lintFileMatch}`, ({ err }) => {
      const opts = err ? { failure: true } : { success: true };
      cleanup(opts);
    });
  });
};

module.export = {
  runLint,
  runScript,
  cleanup,
  exitFailure,
  defaults,
  chooseScript
};
