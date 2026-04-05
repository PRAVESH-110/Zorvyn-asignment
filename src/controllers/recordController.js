const FinancialRecord = require("../models/FinancialRecord");

/** Active records only (excludes soft-deleted; treats missing field as not deleted). */
const notDeleted = { deleted: { $ne: true } };

const createRecord = async (req, res, next) => {
  try {
    const record = await FinancialRecord.create({
      ...req.body,
      createdBy: req.user._id,
    });

    return res.status(201).json({ message: "Record created", record });
  } catch (error) {
    return next(error);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page, limit } = req.query;
    const filter = { ...notDeleted }; //spread reates a new object each time, 
    // copies the deleted condition onto it

    //can also be write as 
    //const filter = { deleted: { $ne: true } }

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    //Runs multiple async tasks in parallel and assigns their results cleanly using array destructuring rather than separate queries/promises
    const [records, total] = await Promise.all([
      FinancialRecord.find(filter)
        .populate("createdBy", "name email role")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      FinancialRecord.countDocuments(filter), //countDocuments still scans/indexes to count matches
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findOne({
      _id: req.params.id,
      ...notDeleted,
    }).populate("createdBy", "name email role");
    if (!record) {
      return next({ statusCode: 404, message: "Record not found" });
    }

    return res.status(200).json({ record });
  } catch (error) {
    return next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.deleted;
    const record = await FinancialRecord.findOneAndUpdate(
      { _id: req.params.id, ...notDeleted },
      updates,
      { new: true }
    );
    if (!record) {
      return next({ statusCode: 404, message: "Record not found" });
    }

    return res.status(200).json({ message: "Record updated", record });
  } catch (error) {
    return next(error);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findOneAndUpdate(
      { _id: req.params.id, ...notDeleted },
      { deleted: true },
      { new: true }
    );
    if (!record) {
      return next({ statusCode: 404, message: "Record not found" });
    }

    return res.status(200).json({ message: "Record deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
