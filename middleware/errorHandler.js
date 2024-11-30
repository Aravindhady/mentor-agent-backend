const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map(error => error.message).join(', ')
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Email already exists'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server'
  });
};

module.exports = errorHandler; 