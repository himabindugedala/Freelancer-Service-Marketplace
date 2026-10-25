export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(422).json({
        success: false,
        message: 'Validation failed for request data',
        errors: formattedErrors,
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Malformed request data',
    });
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(422).json({
        success: false,
        message: 'Validation failed for query parameters',
        errors: formattedErrors,
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Malformed query parameters',
    });
  }
};
