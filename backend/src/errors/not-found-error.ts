class NotFoundError extends Error {
  readonly statusCode = 404;
}

export default NotFoundError;
