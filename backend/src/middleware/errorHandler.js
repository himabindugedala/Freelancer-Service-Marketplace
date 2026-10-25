export const errorHandler = (err, req, res, next) => {
  console.error('[Error] Details:', {
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
      field,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for resource identifier: ${err.value}`,
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
