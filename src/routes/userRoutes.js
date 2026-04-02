const express = require("express");
const { getUsers, updateUserRole, updateUserStatus } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { listUsersSchema, updateRoleSchema, updateStatusSchema } = require("../validators/userValidators");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("admin"));

router.get("/", validate(listUsersSchema), getUsers);
router.patch("/:id/role", validate(updateRoleSchema), updateUserRole);
router.patch("/:id/status", validate(updateStatusSchema), updateUserStatus);

module.exports = router;
