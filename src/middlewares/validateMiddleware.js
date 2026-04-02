const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return next({
        statusCode: 400,
        message: "Validation failed",
        details,
      });
    }

    req.body = result.data.body;
    req.params = result.data.params;
    req.query = result.data.query;
    return next();
  };
};

module.exports = validate;
