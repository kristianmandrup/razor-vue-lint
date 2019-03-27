const childProcess = require("child_process");
const defaultCommand = "spawn";

const { logInfo, logError } = require("./util");

function runScript(opts = {}, callback) {
  let shell = false;
  let arg;
  if (typeof opts === "string") {
    if (opts[0] === ":") {
      shell = true;
      arg = opts.slice(1);
    }
    opts = {
      command: defaultCommand,
      arg,
      shell
    };
  }
  let { command, args } = opts;
  shell = shell || opts.shell;
  arg = arg || opts.arg;
  command = command || defaultCommand;

  // keep track of whether callback has been invoked to prevent multiple invocations
  var invoked = false;

  args = args || [arg];
  if (typeof args === "string") {
    args = [args];
  }
  if (!args.length > 0) {
    throw `Invalid or missing arguments to execute ${command}`;
  }

  if (shell) {
    args.push({ shell: true });
  }

  var process = childProcess[command](...args);

  process.stdout.on("data", data => {
    logInfo(data);
  });

  process.stderr.on("data", data => {
    logError(data);
  });

  // listen for errors as they may prevent the exit event from firing
  process.on("error", function(err) {
    if (invoked) return;
    invoked = true;
    callback({ err });
  });

  // execute the callback once the process has finished running
  process.on("exit", function(code, signal) {
    if (invoked) return;
    invoked = true;
    var err = code === 0 ? null : new Error("exit code " + code);
    callback({ err, code, signal });
  });
}

module.exports = {
  runScript
};
