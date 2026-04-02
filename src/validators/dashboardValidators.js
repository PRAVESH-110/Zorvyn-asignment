const { z } = require("zod");

const dashboardSummarySchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

module.exports = {
  dashboardSummarySchema,
};
