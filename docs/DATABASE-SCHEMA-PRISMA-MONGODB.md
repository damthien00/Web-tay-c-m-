# Money Tracker Database: Prisma + MongoDB

This document translates the existing Supabase (SQL) schema into a Prisma schema for MongoDB, explains key design choices, and provides the exact steps to set it up locally and in CI.

Related files:
- Supabase reference: docs/DATABASE-SCHEMA-SUPABASE.md
- Prisma schema (Mongo): prisma/schema.prisma

## What changed vs. Supabase

- We are using MongoDB via Prisma (datasource provider = "mongodb").
- Tables are modeled as MongoDB collections through Prisma models.
- Numeric amounts use `BigInt` to keep integer money values (e.g., store cents), like Supabase BIGINT.
- Timestamps use `DateTime` with `@default(now())` and `@updatedAt` where applicable.
- Relationships are implemented with Prisma relations. For MongoDB, Prisma manages referential actions in the client; the database itself doesn’t enforce foreign keys.
- Collection names match the Supabase table names via `@@map`:
  - profiles, transactions, savings_goals, projects, project_expenses, project_revenues, savings_contributions

## Models added to prisma/schema.prisma

These models extend the existing auth models (User, Session, Account, Verification) already present in the schema. We did not remove or change existing auth models to avoid breaking authentication.

- Profile (1:1 with User; primary key equals User.id)
  - id (String, PK) – same value as `User.id`
  - fullName, email, phone?, location?, occupation?, birthDate?, avatarUrl?
  - createdAt, updatedAt

- Transaction
  - id (ObjectId, PK)
  - userId (String → User.id)
  - type (enum: income | expense)
  - amount (BigInt), category, description, paymentMethod, location?, tags[]
  - projectId? (ObjectId → Project.id)
  - createdAt, updatedAt
  - Indexes: userId, createdAt, type, category

- SavingsGoal
  - id (ObjectId, PK)
  - userId (String → User.id)
  - title, targetAmount (BigInt), currentAmount (BigInt, default 0)
  - deadline (DateTime), category, isCompleted (Boolean)
  - createdAt, updatedAt
  - Back-rel: contributions (SavingsContribution[])
  - Indexes: userId, deadline

- Project
  - id (ObjectId, PK)
  - userId (String → User.id)
  - name, description, budget (BigInt)
  - totalExpenses (BigInt), totalRevenue (BigInt)
  - status (String) – kept as free-text to allow values like "on-hold"
  - startDate, endDate?, category
  - currency (enum: VND | USD, default VND)
  - createdAt, updatedAt
  - Back-rels: transactions, expenses, revenues
  - Indexes: userId, status

- ProjectExpense
  - id (ObjectId, PK)
  - projectId (ObjectId → Project.id), userId (String → User.id)
  - amount (BigInt), description, category, date
  - createdAt
  - Indexes: projectId

- ProjectRevenue
  - id (ObjectId, PK)
  - projectId (ObjectId → Project.id), userId (String → User.id)
  - amount (BigInt), description, source, status (enum: pending | received | overdue)
  - paidAmount (BigInt, default 0), invoiceNumber?, dueDate?, date
  - createdAt
  - Indexes: projectId

- SavingsContribution
  - id (ObjectId, PK)
  - goalId (ObjectId → SavingsGoal.id), userId (String → User.id)
  - amount (BigInt), description?
  - createdAt
  - Indexes: goalId

### Enums
- TransactionType: income | expense
- RevenueStatus: pending | received | overdue
- Currency: VND | USD

## Important type/relationship notes

- User.id is a `String` in the existing schema (not marked `@db.ObjectId`). To maintain compatibility, all relations pointing to User use `String` ids.
- New domain models use ObjectId as their primary keys, except Profile which reuses User.id as the PK (common pattern for 1:1 user profiles).
- Prisma’s `onDelete: Cascade` is specified on relations to mirror the Supabase intent (e.g., deleting a project should remove child expenses/revenues). For MongoDB this behavior is handled by Prisma Client (not the database) and only applies when mutations are performed through Prisma.

## How to set up locally

1) Set the MongoDB URL
- Create or update `.env` at the project root with your MongoDB connection string.
  Example:
  
  DATABASE_URL="mongodb+srv://USER:PASS@cluster0.example.mongodb.net/money-tracker?retryWrites=true&w=majority"

2) Install dependencies
- Ensure deps are installed:
  
  npm install

3) Generate Prisma Client
- Generate the client for your environment:
  
  npx prisma generate

4) Push the schema to MongoDB
- MongoDB uses `db push` (no SQL migrations):
  
  npx prisma db push

5) Optional: Open Prisma Studio
  
  npx prisma studio

## Indexes
We implemented the following indexes similar to the Supabase document:
- transactions: userId, createdAt, type, category
- projects: userId, status
- project_expenses: projectId
- project_revenues: projectId
- savings_goals: userId, deadline
- savings_contributions: goalId

MongoDB may choose compound or partial indexes differently than SQL; adjust if you need more complex performance tuning.

## Data modeling choices vs. Supabase SQL
- Supabase CHECK constraints (e.g., positive amounts) are not expressed at the DB layer in MongoDB via Prisma. Enforce these in application code and/or use zod/valibot validators on inputs.
- `Project.status` remains a String (not enum) to accommodate values like `on-hold` as-is. If you prefer strict enums, update the UI/API to use enum-friendly values (e.g., `on_hold`) and change the Prisma model accordingly.
- Money values are `BigInt` to preserve precision. Keep amounts in the smallest currency unit (e.g., VND has no subunit; USD store cents) and format in the UI.

## Next steps for the app layer
- Wire up your services/repositories to the new models (transactions, projects, goals, etc.).
- Update any seed scripts if needed.
- Add API route handlers / server actions for CRUD.
- Add request validation to mirror the SQL constraints.

## Troubleshooting
- If Prisma validation fails about missing opposite relation fields, ensure back-relation arrays/fields exist (we added these to User, Project, SavingsGoal).
- If your cluster requires TLS/SRV settings, adjust the `DATABASE_URL` accordingly.
- Run `npx prisma format` to auto-format the schema if needed.

---
This document reflects the current state of prisma/schema.prisma and maps the original Supabase design to MongoDB via Prisma. If the FE uses hard-coded strings for statuses or types, ensure they match the schema (see enums and notes above).
