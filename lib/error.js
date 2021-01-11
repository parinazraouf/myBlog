const httpErrors = require('http-errors');

const httpThrow = exports.httpThrow = (status, message, ...args) => {
  throw httpErrors(status, message, args.length ? Object.assign(...args) : undefined);
};

exports.httpInvariant = (condition, status, message, ...args) => {
  if (condition) {
    return;
  }
  httpThrow(status, message, ...args);
};

const HttpError = exports.HttpError = httpErrors.HttpError;

exports.createHttpError = httpErrors;

exports.uncaughtExceptionHandler = err => {
  console.error(`[Exception] ${err.message}\n  stack: ${err.stack}`);
};

exports.unhandledRejectionHandler = err => {
  if (err instanceof Error) {
    console.error(`[UnhandledRejection] ${err.message}\n  stack: ${err.stack}`);
  } else {
    console.error(`[UnhandledRejection] ${err}`);
  }
};

exports.httpErrorHandler = (err, ctx) => {
  if (
    (err instanceof HttpError && err.status !== 500) ||
    (err.code === 'EPIPE' && err.errno === 'EPIPE' && err.syscall === 'write')
  ) {
    return;
  }

  if (ctx) {
    console.error(`[HttpError] [id: ${err.id}] [path: ${ctx.path}] ${err.message}\n  stack: ${err.stack}`);
  } else {
    console.error(`[HttpError] [id: ${err.id}] ${err.message}\n  stack: ${err.stack}`);
  }
};
