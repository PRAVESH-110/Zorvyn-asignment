const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next({ statusCode: 409, message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      status,
    });

    return res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const bootstrapAdmin = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return next({ statusCode: 403, message: "Bootstrap is disabled after first user creation" });
    }

    const { name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "admin",
      status: "active",
    });

    return res.status(201).json({
      message: "Bootstrap admin created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next({ statusCode: 401, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return next({ statusCode: 401, message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return next({ statusCode: 403, message: "User account is inactive" });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  bootstrapAdmin,
  loginUser,
};
