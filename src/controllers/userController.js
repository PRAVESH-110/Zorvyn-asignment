const User = require("../models/User");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-passwordHash");
    if (!user) {
      return next({ statusCode: 404, message: "User not found" });
    }

    return res.status(200).json({ message: "User role updated", user });
  } catch (error) {
    return next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select("-passwordHash");
    if (!user) {
      return next({ statusCode: 404, message: "User not found" });
    }

    return res.status(200).json({ message: "User status updated", user });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  updateUserStatus,
};
