import mongoose from "mongoose";

/* ============================================================
   404 NOT FOUND
============================================================ */

export const notFound = (
  req,
  res,
  next
) => {

  res.status(404);

  next(
    new Error(
      `Route not found: ${req.originalUrl}`
    )
  );

};

/* ============================================================
   GLOBAL ERROR HANDLER
============================================================ */

export const errorHandler = (
  err,
  req,
  res,
  next
) => {

  console.error("ERROR:", err);

  let statusCode =
    res.statusCode !== 200
      ? res.statusCode
      : 500;

  let message =
    err.message ||
    "Internal Server Error";

  /*
   * Invalid MongoDB ObjectId
   */
  if (err instanceof mongoose.Error.CastError) {

    statusCode = 400;

    message =
      "Invalid resource ID.";

  }

  /*
   * Mongoose Validation Error
   */
  if (
    err instanceof
    mongoose.Error.ValidationError
  ) {

    statusCode = 400;

    message = Object.values(
      err.errors
    )
      .map(
        (item) => item.message
      )
      .join(", ");

  }

  /*
   * Duplicate Key Error
   */
  if (err.code === 11000) {

    statusCode = 409;

    const field =
      Object.keys(
        err.keyValue
      )[0];

    message =
      `${field} already exists.`;

  }

  /*
   * JWT Errors
   */
  if (
    err.name ===
    "JsonWebTokenError"
  ) {

    statusCode = 401;

    message =
      "Invalid authentication token.";

  }

  if (
    err.name ===
    "TokenExpiredError"
  ) {

    statusCode = 401;

    message =
      "Authentication token has expired.";

  }

  res.status(statusCode).json({

    success: false,

    statusCode,

    message,

    timestamp:
      new Date().toISOString(),

    ...(process.env.NODE_ENV !==
      "production" && {
      stack: err.stack,
    }),

  });

};