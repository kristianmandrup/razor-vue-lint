const path = require("path");
const { runScript } = require("run-script");

const exitFailure = () => Process.exit(1);

const cleanup = ({ failure, success, error } = {}) => {
  runScript(":del /s /q *.lintable", ({ err }) => {
    if (err || failure) {
      const errorMsg = error || err;
      console.error(errorMsg);
      exitFailure();
    }
    if (success) {
      console.error("SUCCESS");
    }
  });
};

const runLint = (scriptPath, lintFileMatch) => {
  if (typeof scriptPath !== "string") {
    throw `runLint: Missing or invalid scriptPath ${scriptPath}`;
  }

  runScript(`:node ${scriptPath}`, ({ err }) => {
    if (err) {
      cleanup({ failure: true, error: err });
    }

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
  exitFailure
};
