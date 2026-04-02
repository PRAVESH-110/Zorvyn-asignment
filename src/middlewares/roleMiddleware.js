const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next({ statusCode: 401, message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next({ statusCode: 403, message: "You do not have permission for this action" });
    }

    return next();
  };
};

module.exports = roleMiddleware;
