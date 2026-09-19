# MIPRO ERP Production Backend Setup

## Recommended Architecture

Keep a **monorepo**, but separate the runtime responsibilities inside it. A second repository is not required for the first production release.

```text
apps/web       React + Vite user interface
apps/api       TypeScript API and business services
packages/contracts  Zod DTOs shared by web and API
packages/domain     landed-cost, FIFO, ledger and permission rules
database       migrations, schema and seed/reference data
```

Deploy the web app and short HTTP API routes in one Vercel project for same-origin `/api/*` calls. Store persistent data outside Vercel functions. The present in-memory arrays are demo-only because serverless instances restart and do not share memory.

## Production Tools

| Need | Recommended tool | Purpose |
|---|---|---|
| Database | PostgreSQL through Supabase, Neon, or managed PostgreSQL | Persistent ERP records and transactions |
| ORM/migrations | Drizzle ORM or Prisma | Typed queries and repeatable schema migrations |
| Authentication | Supabase Auth, Clerk, or Auth.js | Password hashing, sessions, recovery, and optional MFA |
| File storage | Supabase Storage or S3-compatible storage | PI, LC, invoice, receipt, evidence, and profile files |
| Validation/contracts | Zod | Validate every API request and response |
| Decimal arithmetic | `decimal.js` plus PostgreSQL `numeric` columns | Exact landed cost, stock cost, invoice, due, and account values |
| Monitoring | Vercel logs plus Sentry | API errors, frontend errors, and release diagnostics |
| Email | Resend or a company SMTP provider | Invitations, password reset, and workflow notifications |
| Scheduled work | Vercel Cron or a queue worker | Expiry alerts, overdue follow-ups, and scheduled summaries |

## Local Setup

1. Install Node.js LTS, Git, and PostgreSQL tooling or create a managed PostgreSQL project.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` for local development.
4. Add production service variables. A typical set is:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/mipro
AUTH_SECRET=generate-a-long-random-secret
STORAGE_URL=https://your-storage.example
STORAGE_SERVICE_KEY=server-only-secret
VITE_API_BASE_URL=
```

Keep `VITE_API_BASE_URL` empty when web and API use the same Vercel project. Never expose database, storage service, or authentication secrets with a `VITE_` prefix; Vite variables are sent to the browser.

5. Create migrations for users/access, products/suppliers, import cases/items/costs/snapshots/receipts, stock batches/movements, customers/quotes/orders/deliveries/invoices/collections, expenses/accounts/transactions, marketing activity, documents, business decisions, and audit events.
6. Import approved master data, then migrate opening stock and customer opening balances through audited migration commands.
7. Replace each in-memory service operation with a database transaction while keeping the existing DTO and React Query interfaces.
8. Run `npm run lint`, `npm test`, `npm run test:flows`, and `npm run build` before deployment.

## Transaction Boundaries

Use one database transaction for each connected posting action:

- landed-cost finalization: snapshot, allocations, status, audit;
- warehouse receipt: receipt lines, batches, stock movements, import status;
- delivery: FIFO batch allocations, stock-out movements, delivery status;
- invoice approval: invoice state and customer receivable entry;
- collection: receipt, customer due reduction, account credit, audit;
- expense or voucher: expense/transaction and account debit or credit.

Use immutable financial and stock postings. Corrections should reverse and repost with a reason rather than delete history.

## Vercel Deployment

The current repository already supports a Vite build plus the serverless entry at `api/index.ts`. Configure the Vercel project as follows:

```text
Framework preset: Vite
Build command: npm run build
Output directory: dist
Install command: npm install
Node.js: current Vercel-supported LTS
```

Add server-only environment variables in Vercel Project Settings for Production, Preview, and Development as appropriate. Do not set `VITE_API_BASE_URL` for this same-project deployment. After deployment verify:

```text
https://YOUR-PROJECT.vercel.app/api/health
https://YOUR-PROJECT.vercel.app/login
```

The Vercel project is already a dynamic serverless site when `/api` functions are deployed; changing a dashboard label from “static” does not create persistence. The decisive production change is connecting those functions to PostgreSQL, authentication, and object storage.

## When To Use A Separate Backend Deployment

Keep the API in the monorepo but deploy it separately only when the system needs long-running jobs, persistent WebSockets, heavy PDF generation, large imports, private-network database access, or independent API scaling. In that case, deploy `apps/api` to Railway, Render, Fly.io, Azure, or AWS and set `VITE_API_BASE_URL` to its HTTPS origin with strict CORS.

For this ERP, the practical first production choice is **one monorepo, one Vercel web/API project, managed PostgreSQL, managed object storage, and real authentication**. It keeps deployment simple without coupling business data to temporary Vercel function memory.
