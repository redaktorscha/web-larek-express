class UnauthorizedError extends Error {
  readonly statusCode = 401;
}

export default UnauthorizedError;
