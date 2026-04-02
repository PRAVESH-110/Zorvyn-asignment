const express = require("express");
const { getDashboardSummary } = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { dashboardSummarySchema } = require("../validators/dashboardValidators");

const router = express.Router();

router.get(
  "/summary",
  authMiddleware,
  roleMiddleware("analyst", "admin"),
  validate(dashboardSummarySchema),
  getDashboardSummary
);

module.exports = router;
