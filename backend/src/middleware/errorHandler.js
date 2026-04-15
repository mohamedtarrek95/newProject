const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: `${field} already exists`
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: err.message
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File size too large. Maximum size is 5MB'
    });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

module.exports = { errorHandler };
