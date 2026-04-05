const FinancialRecord = require("../models/FinancialRecord");

const matchConditions = { deleted: { $ne: true } };

const getDashboardSummary = async (req, res, next) => {
  try {
    // 1. Default date bounding (past 6 months) if dates not provided
    // This prevents a massive full-table scan on the entire DB
    const finalMatchConditions = { ...matchConditions };
    
    if (req.query.startDate || req.query.endDate) {
      finalMatchConditions.date = {};
      if (req.query.startDate) finalMatchConditions.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) finalMatchConditions.date.$lte = new Date(req.query.endDate);
    } else {
      const defaultStart = new Date();
      defaultStart.setMonth(defaultStart.getMonth() - 6);
      finalMatchConditions.date = { $gte: defaultStart };
    }

    const matchActive = { $match: finalMatchConditions };

    // 2. Run queries CONCURRENTLY to massively speed up API response time
    const [totals, categoryTotals, recentActivity, monthlyTrends, weeklyTrends] = await Promise.all([
      FinancialRecord.aggregate([
        matchActive,
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),
      FinancialRecord.aggregate([
        matchActive,
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
          },
        },
        { $sort: { total: -1 } },
      ]),
      FinancialRecord.find(finalMatchConditions)
        .sort({ date: -1, createdAt: -1 })
        .limit(5)
        .populate("createdBy", "name role"),
      FinancialRecord.aggregate([
        matchActive,
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            income: {
              $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
            },
            expenses: {
              $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      FinancialRecord.aggregate([
        matchActive,
        {
          $group: {
            _id: {
              year: { $isoWeekYear: "$date" },
              week: { $isoWeek: "$date" },
            },
            income: {
              $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
            },
            expenses: {
              $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.week": 1 } },
      ]),
    ]);

    const totalIncome = totals.find((item) => item._id === "income")?.total || 0;
    const totalExpenses = totals.find((item) => item._id === "expense")?.total || 0;

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
