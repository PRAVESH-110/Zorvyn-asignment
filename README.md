# Finance Dashboard Backend

Simple MVC backend built with Node.js, Express, MongoDB (Mongoose), JWT authentication, and role-based access control.

## Features
- User and role management (`viewer`, `analyst`, `admin`)
- Active/inactive user status handling
- Financial records CRUD with filters
- Dashboard summary API with totals and trends
- Request validation with Zod
- Centralized error handling with consistent responses

## Tech Stack
- Node.js (CommonJS)
- Express
- MongoDB + Mongoose
- JWT (jssonwebtoken)
- Password hashing (bcrypt)
- Validation (zod)
- Rate limiting (express-rate-limit)

## Project Structure
```text
src/
  app.js
  server.js
  config/
    db.js
  models/
    User.js
    FinancialRecord.js
  controllers/
    authController.js
    userController.js
    recordController.js
    dashboardController.js
  routes/
    authRoutes.js
    userRoutes.js
    recordRoutes.js
    dashboardRoutes.js
  middlewares/
    authMiddleware.js
    roleMiddleware.js
    validateMiddleware.js
    errorHandler.js
  validators/
    authValidators.js
    userValidators.js
    recordValidators.js
    dashboardValidators.js
```

## Environment Variables
Create a `.env` file in `backend`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/finance_dashboard
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d
```

## Run Locally
```bash
npm install
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/bootstrap-admin` - create first admin (works only when no users exist)
- `POST /api/auth/login` - login and get JWT token
- `POST /api/auth/register` - admin-only user creation

### Users (admin only)
- `GET /api/users`
- `PATCH /api/users/:id/role`
- `PATCH /api/users/:id/status`

### Financial Records
- `POST /api/records` - admin only
- `GET /api/records` - viewer/analyst/admin
- `GET /api/records/:id` - viewer/analyst/admin
- `PATCH /api/records/:id` - admin only
- `DELETE /api/records/:id` - admin only

Filters for `GET /api/records`:
- `type`: `income|expense`
- `category`: text
- `startDate`: ISO date string
- `endDate`: ISO date string

### Dashboard Summary (analyst/admin)
- `GET /api/dashboard/summary`
- Returns:
  - total income
  - total expenses
  - net balance
  - category wise totals
  - recent activity
  - monthly trends
  - weekly trends

## Authorization Rules
- `viewer`: can read records only
- `analyst`: can read records and dashboard summaries
- `admin`: full access to users and records

## Error Response Format
```json
{
  "message": "Validation failed",
  "details": [
    {
      "path": "body.email",
      "message": "Invalid email"
    }
  ]
}
```

## Manual Test Cases

### 1) Authentication
1. Call `POST /api/auth/bootstrap-admin` with valid data when DB has no users -> expect `201`.
2. Call bootstrap endpoint again -> expect `403`.
3. Call `POST /api/auth/login` with correct credentials -> expect `200` and token.
4. Login with wrong password -> expect `401`.
5. Set user status to inactive and login -> expect `403`.

### 2) Role Authorization
1. Login as `viewer`, call `POST /api/records` -> expect `403`.
2. Login as `viewer`, call `GET /api/records` -> expect `200`.
3. Login as `analyst`, call `GET /api/dashboard/summary` -> expect `200`.
4. Login as `viewer`, call dashboard summary -> expect `403`.

### 3) User Management
1. Login as `admin`, call `POST /api/auth/register` -> expect `201`.
2. Admin updates role using `PATCH /api/users/:id/role` -> expect `200`.
3. Admin updates status using `PATCH /api/users/:id/status` -> expect `200`.
4. Non-admin calling user APIs -> expect `403`.

### 4) Record CRUD
1. Admin creates record -> expect `201`.
2. Any allowed role fetches records -> expect `200`.
3. Admin updates record -> expect `200`.
4. Admin deletes record -> expect `200`.
5. Read/update/delete with invalid ID -> expect `400`.
6. Read/update/delete non-existing valid ID -> expect `404`.

### 5) Filtering
1. `GET /api/records?type=income` returns only income records.
2. `GET /api/records?category=Salary` filters by category.
3. `GET /api/records?startDate=2026-01-01&endDate=2026-03-31` returns range data.
4. Invalid date format in query -> expect `400`.

### 6) Dashboard Summary Correctness
1. Seed records with known totals.
2. Verify `totalIncome`, `totalExpenses`, and `netBalance`.
3. Verify category totals aggregate correctly.
4. Verify recent activity returns latest records.
5. Verify monthly and weekly trend buckets match seeded data.



## Architectural Decisions & Optimization/ Tradeoffs

The dashboard logic (`GET /api/dashboard/summary`) was deliberately designed with scale in mind. Rather than executing simple CRUD operations and manually computing totals in memory (which breaks on large datasets), the endpoint delegates heavy computations to **MongoDB Aggregation Pipelines**. Optimizations include:
- **Date Bounding by Default:** The aggregations are strictly bounded to the last 6 months(taken assumption) via a `$match` operator unless dates are provided. This guarantees that MongoDB CPU spikes are avoided, protecting the server against massive full-collection scans on historical databases.
(getDashboardSummary function in controllers\dashboardController.js)

- **Concurrent Execution:** The sophisticated dashboard logic executes 5 separate heavy database queries simultaneously using `Promise.all()`, which slashes API latency horizontally instead of falling into sequential query bottlenecks.
- **Caching Mechanism (For future scalability):** To handle extreme read-heavy concurrency without hammering the database, the architecture is ready to be wrapped in an in-memory Node cache (like `node-cache`) or a distributed **Redis Server**. The `GET /api/dashboard/summary` would directly return the cached response, and backend logic would be added to gracefully **invalidate the cache only when a new record is created, edited, or deleted.**