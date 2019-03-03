const returnError = function(res, err) {
  return res.json({
    success: false,
    error: {
      name: err.name,
      message: err.message
    }
  });
};

module.exports = returnError;