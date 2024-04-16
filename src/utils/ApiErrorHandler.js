class apiErrors extends Error {
  constructor(
    statusCode,
    errors = [],
    stack = "",
    _message = "something want Wrong!",
  ) {
    this.statusCode = statusCode;
    this.data = null;
    this.errors = errors;
    this.message = message;
    this.success = false;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export default apiErrors