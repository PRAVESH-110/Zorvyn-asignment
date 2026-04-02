const { z } = require("zod");

const optionalDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: "Invalid date format" });

const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    type: z.enum(["income", "expense"]),
    category: z.string().trim().min(1),
    date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), { message: "Invalid date format" }),
    notes: z.string().trim().optional().default(""),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const listRecordsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    type: z.enum(["income", "expense"]).optional(),
    category: z.string().trim().optional(),
    startDate: optionalDate.optional(),
    endDate: optionalDate.optional(),
  }),
});

const recordIdParams = z.object({
  id: z.string().min(1),
});

const recordByIdSchema = z.object({
  body: z.object({}).default({}),
  params: recordIdParams,
  query: z.object({}).default({}),
});

const updateRecordSchema = z.object({
  body: z
    .object({
      amount: z.number().positive().optional(),
      type: z.enum(["income", "expense"]).optional(),
      category: z.string().trim().min(1).optional(),
      date: optionalDate.optional(),
      notes: z.string().trim().optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, { message: "At least one field is required" }),
  params: recordIdParams,
  query: z.object({}).default({}),
});

module.exports = {
  createRecordSchema,
  listRecordsSchema,
  recordByIdSchema,
  updateRecordSchema,
};
