const FinancialRecord = require("../models/FinancialRecord");

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
    const { type, category, startDate, endDate } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const records = await FinancialRecord.find(filter)
      .populate("createdBy", "name email role")
      .sort({ date: -1 });

    return res.status(200).json({ records });
  } catch (error) {
    return next(error);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findById(req.params.id).populate("createdBy", "name email role");
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
    const record = await FinancialRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const record = await FinancialRecord.findByIdAndDelete(req.params.id);
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
