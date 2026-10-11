class BadRequestError extends Error {
  readonly statusCode = 400;
}

export default BadRequestError;
