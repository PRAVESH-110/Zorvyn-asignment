const express = require("express");
const {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require("../controllers/recordController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
  createRecordSchema,
  listRecordsSchema,
  recordByIdSchema,
  updateRecordSchema,
} = require("../validators/recordValidators");

const router = express.Router();

router.use(authMiddleware);

router.get("/", roleMiddleware("viewer", "analyst", "admin"), validate(listRecordsSchema), getRecords);
router.get("/:id", roleMiddleware("viewer", "analyst", "admin"), validate(recordByIdSchema), getRecordById);
router.post("/", roleMiddleware("admin"), validate(createRecordSchema), createRecord);
router.patch("/:id", roleMiddleware("admin"), validate(updateRecordSchema), updateRecord);
router.delete("/:id", roleMiddleware("admin"), validate(recordByIdSchema), deleteRecord);

module.exports = router;
