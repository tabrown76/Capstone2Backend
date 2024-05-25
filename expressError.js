/** ExpressError extends normal JS error so we can
 *  add a status when we make an instance of it.
 *
 *  The error-handling middleware will return this.
 */

class ExpressError extends Error {
  /**
   * Create an ExpressError.
   * @param {string} message - The error message.
   * @param {number} status - The HTTP status code.
   */
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

/**
 * 404 NOT FOUND error.
 * @extends ExpressError
 */
class NotFoundError extends ExpressError {
  /**
   * Create a NotFoundError.
   * @param {string} [message="Not Found"] - The error message.
   */
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

/**
 * 401 UNAUTHORIZED error.
 * @extends ExpressError
 */
class UnauthorizedError extends ExpressError {
  /**
   * Create an UnauthorizedError.
   * @param {string} [message="Unauthorized"] - The error message.
   */
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * 400 BAD REQUEST error.
 * @extends ExpressError
 */
class BadRequestError extends ExpressError {
  /**
   * Create a BadRequestError.
   * @param {string} [message="Bad Request"] - The error message.
   */
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

/**
 * 403 FORBIDDEN error.
 * @extends ExpressError
 */
class ForbiddenError extends ExpressError {
  /**
   * Create a ForbiddenError.
   * @param {string} [message="Forbidden"] - The error message.
   */
  constructor(message = "Bad Request") {
    super(message, 403);
  }
}

module.exports = {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
};