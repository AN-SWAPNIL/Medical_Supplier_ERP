# Mipro Medical Import & Distribution ERP

A production-grade frontend prototype for a Bangladeshi medical device importer/distributor. The app is built with React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand, React Hook Form, Zod, Recharts, Lucide icons, and an Express mock backend.

The prototype covers the complete business flow from supplier inquiry to accounts closing:

Supplier Inquiry -> PI -> PO -> LC/TT -> Shipment -> Customs/Landed Cost -> GRN -> Inventory -> Quotation -> Sales Order -> Challan -> Invoice -> Collection -> Accounts -> Reports.

It also includes the refined mobile-sales frontend scope: GPS visit logs, a no-key OpenStreetMap route tracking view, offline queue mock, order entry, collection entry, manager sync, and role-safe AI answers.

## Run

```bash
npm install
npm run dev
```

This starts:

- Frontend: `http://localhost:5173`
- Mock API: `http://localhost:4174`

Useful scripts:

```bash
npm run dev:web
npm run dev:api
npm run dev:server
npm run server
npm run lint
npm run build
npm run smoke
```

## Demo Users

All passwords are `password123`.

| Email | Role |
| --- | --- |
| `superadmin@mipro.local` | Super Admin |
| `md@mipro.local` | Managing Director |
| `accounts@mipro.local` | Accounts |
| `import@mipro.local` | Import Officer |
| `warehouse@mipro.local` | Warehouse Manager |
| `salesmanager@mipro.local` | Sales Manager |
| `sales1@mipro.local` | Sales Executive |
| `sales2@mipro.local` | Sales Executive |

## Architecture

- `src/components` contains reusable layout, table, form, report, print, AI, and UI primitives.
- `src/features` contains feature pages for auth, dashboard, modules, reports, AI agents, audit/security, settings, users, and print previews.
- `src/lib/api` contains the backend-ready API client.
- `src/lib/auth` contains localStorage-backed mock session state using Zustand.
- `src/lib/permissions` contains the central RBAC matrix and navigation model.
- `src/data/seed.ts` contains mock seed data used by the Express backend only.
- `server/index.ts` exposes REST endpoints with `{ success, message, data, meta }` responses.

## RBAC

The permission matrix controls:

- Sidebar visibility
- Route protection
- Create/edit/delete/approve/post/export buttons
- Sales Executive data scoping
- Super Admin-only view-as-role demo mode

Sales Executives only see their own customers, quotations, orders, challans, invoices, visits, targets, and collections.

## Mock API

Core endpoints include:

- `POST /api/auth/login`
- `POST /api/auth/signup-request`
- `GET /api/me`
- `GET /api/dashboard`
- `GET /api/products`
- `GET /api/customers`
- `GET /api/purchase-orders`
- `GET /api/shipments`
- `GET /api/customs/landed-cost`
- `GET /api/grn`
- `GET /api/inventory/stock`
- `GET /api/sales/invoices`
- `GET /api/accounts/vouchers`
- `GET /api/reports/summary`
- `GET /api/ai/recommendations`
- `GET /api/audit-logs`

Most collections support list/detail/create/update/delete and action routes such as approve, reject, post, and cancel.

## Future Integration Points

- Replace Express endpoints with Supabase tables, auth, storage, and edge functions.
- Replace mock AI recommendation endpoints with LangChain/LangGraph services.
- Move localStorage session handling to Supabase auth session management.
- Connect print/export actions to real PDF generation.

## Deploy To Vercel

The repo includes `vercel.json` plus serverless API entrypoints under `api/`.

Recommended Vercel settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Environment Variables: none required for same-project mock API

Do not set `VITE_API_BASE_URL` on Vercel for this prototype. The frontend should call relative `/api/*` routes in the same Vercel project. If `VITE_API_BASE_URL` is set to `http://localhost:4174`, deployed browsers will fail because `localhost` means the visitor's computer, not the Vercel function.

The frontend calls relative `/api/*` routes by default. On Vercel those routes are handled by `api/[...path].ts`, which imports the Express mock app.

CLI deploy:

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

After pushing to GitHub, the easiest path is Vercel Dashboard -> Add New Project -> Import Git Repository -> select this repo -> keep the Vite settings above -> Deploy. Test `/login`, `/app/dashboard`, `/app/sales/mobile-control`, `/api/health`, and `/api/v1/dashboard/summary` after the deployment finishes.

## Verification

The current prototype passes:

```bash
npm run lint
npm run build
npm run smoke
```

Smoke tests capture desktop/mobile screenshots under `artifacts/` and verify Sales Executive scoping plus account access denial.
