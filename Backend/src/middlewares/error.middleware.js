const ApiError = require("../utils/ApiError");

const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const isDevelopment = process.env.NODE_ENV === "development";
  let statusCode = 500;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
  } else if (error.code === 11000) {
    statusCode = 409;
  } else if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    statusCode = 400;
  } else if (Number.isInteger(error.statusCode)) {
    statusCode = error.statusCode;
  } else if (Number.isInteger(error.status)) {
    statusCode = error.status;
  }

  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(error);
  }

  const response = {
    success: false,
    message: error.message
  };

  if (isDevelopment || error instanceof ApiError) {
    response.errors = Array.isArray(error.errors) ? error.errors : [];
  }

  if (isDevelopment) {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
