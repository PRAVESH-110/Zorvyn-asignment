const errorHandler = (error, req, res, next) => {
  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource id" });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "Duplicate value violation" });
  }

  const statusCode = error.statusCode || 500;
  const payload = { message: error.message || "Internal server error" };
  if (error.details) {
    payload.details = error.details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = errorHandler;
