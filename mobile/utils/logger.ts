type LogFn = (...args: unknown[]) => void;

interface Logger {
  log: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
  debug: LogFn;
}

const noop: LogFn = () => {};

const logger: Logger = __DEV__
  ? {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
    }
  : {
      log: noop,
      info: noop,
      warn: noop,
      error: noop,
      debug: noop,
    };

export default logger;
