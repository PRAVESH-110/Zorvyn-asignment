const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["viewer", "analyst", "admin"]).default("viewer"),
    status: z.enum(["active", "inactive"]).default("active"),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const bootstrapAdminSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

module.exports = {
  registerSchema,
  loginSchema,
  bootstrapAdminSchema,
};
