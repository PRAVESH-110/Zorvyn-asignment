const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next({ statusCode: 401, message: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId).select("-passwordHash");
    if (!user) {
      return next({ statusCode: 401, message: "Invalid token user" });
    }

    if (user.status !== "active") {
      return next({ statusCode: 403, message: "User account is inactive" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next({ statusCode: 401, message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
