const { z } = require("zod");

const idParams = z.object({
  id: z.string().min(1),
});

const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(["viewer", "analyst", "admin"]),
  }),
  params: idParams,
  query: z.object({}).default({}),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "inactive"]),
  }),
  params: idParams,
  query: z.object({}).default({}),
});

const listUsersSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

module.exports = {
  listUsersSchema,
  updateRoleSchema,
  updateStatusSchema,
};
