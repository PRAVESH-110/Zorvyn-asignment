const FinancialRecord = require("../models/FinancialRecord");

const getDashboardSummary = async (req, res, next) => {
  try {
    const totals = await FinancialRecord.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalIncome = totals.find((item) => item._id === "income")?.total || 0;
    const totalExpenses = totals.find((item) => item._id === "expense")?.total || 0;

    const categoryTotals = await FinancialRecord.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const recentActivity = await FinancialRecord.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name role");

    const monthlyTrends = await FinancialRecord.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const weeklyTrends = await FinancialRecord.aggregate([
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$date" },
            week: { $isoWeek: "$date" },
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    return res.status(200).json({
      summary: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        categoryTotals,
        recentActivity,
        monthlyTrends,
        weeklyTrends,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
