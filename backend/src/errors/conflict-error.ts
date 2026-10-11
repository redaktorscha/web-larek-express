class ConflictError extends Error {
  readonly statusCode = 409;
}

export default ConflictError;
