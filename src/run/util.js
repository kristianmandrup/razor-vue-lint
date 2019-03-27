const logType = (msg, type = "log") => {
  msg = typeof msg === "string" ? msg : msg.toString("utf8");
  const logger = console[type];
  if (!logger) {
    throw `logType: No such console logger ${type}`;
  }
  msg && logger(msg);
};

const logError = msg => {
  logType(msg, "error");
};

const logInfo = msg => {
  logType(msg, "log");
};

const exitFailure = errorMsg => {
  logError(errorMsg);
  Process.exit(1);
};

module.exports = {
  exitFailure,
  logInfo,
  logError
};
