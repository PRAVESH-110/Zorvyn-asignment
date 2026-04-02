const express = require("express");
const { registerUser, loginUser, bootstrapAdmin } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { registerSchema, loginSchema, bootstrapAdminSchema } = require("../validators/authValidators");

const router = express.Router();

router.post("/login", validate(loginSchema), loginUser);
router.post("/bootstrap-admin", validate(bootstrapAdminSchema), bootstrapAdmin);
router.post("/register", authMiddleware, roleMiddleware("admin"), validate(registerSchema), registerUser);

module.exports = router;
