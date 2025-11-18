const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Middleware to validate request using express-validator
 * Checks validation errors and throws ApiError if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    throw ApiError.badRequest("Validation failed", errorMessages);
  }

  next();
};

module.exports = validate;
