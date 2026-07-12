# Mipro HealthCare ERP Frontend Presentation Guide

## Positioning

This is a functional frontend prototype for a medical device import, warehouse, sales, finance and management ERP. It is not just a static demo: all core screens load through API calls, role access is enforced, records can be created/edited/deleted where allowed, workflow actions update status in the mock API session, and sensitive fields are hidden by role.

The current build is intended for client presentation and requirement validation. The backend can later replace the Express mock API without rewriting the screens.

## Source Priority

1. Primary source: `files/Project_Requirements_Presentation.pdf`
2. Data seed source: `files/Mipro HealthCare Corp.xlsx`
3. Secondary background: `files/Project_Meeting_Minutes.pdf`

Note: the meeting-minute idea about showing altered/fake company data should not be presented as a feature. The prototype supports legitimate multi-company/company-scope handling and can support a clearly marked sandbox/demo company if needed.

## Demo URL

Local frontend:

```text
http://localhost:5173
```

Mock API:

```text
http://localhost:4174
```

## Demo Login Accounts

All demo users use:

```text
password123
```

| Role | Email | Demo Purpose |
|---|---|---|
| Super Admin | `superadmin@mipro.local` | Full control, users, roles, settings, audit, all modules |
| Managing Director | `md@mipro.local` | Executive dashboard, approvals, reports, finance visibility |
| Accounts | `accounts@mipro.local` | Vouchers, cash book, bank book, receivables, payables, payroll |
| Import Officer | `import@mipro.local` | Supplier inquiry, PI, PO, LC/TT, shipment, customs, landed cost |
| Warehouse Manager | `warehouse@mipro.local` | GRN, stock, batches, movement, physical count, FEFO |
| Sales Manager | `salesmanager@mipro.local` | Team sales, targets, collections, customer oversight |
| Sales Executive | `sales1@mipro.local` | Own customers, own invoices/orders/collections/visits only |

## Recommended Demo Flow

### 1. Landing and Login

Start from the public landing page and explain:

- The system is purpose-built for medical device import and distribution.
- It covers procurement, import, customs, warehouse, sales, accounts, reports, security and AI.
- The style follows an industrial Chinese enterprise direction while keeping the UI in English for now.

Then login as Super Admin.

### 2. Executive Dashboard

Route:

```text
/app/dashboard
```

Show:

- KPI cards from the Mipro workbook.
- Import pipeline chart.
- Sales product mix.
- Target vs achievement.
- Expiry and FEFO alerts.
- AI executive summary.
- Company scope selector.

Talk track:

> This dashboard connects overseas procurement, shipment, warehouse stock, sales, collection and management reporting in one view.

### 3. Import and Landed Cost Workflow

Routes:

```text
/app/procurement/inquiries
/app/procurement/purchase-orders
/app/import/pi
/app/import/lc
/app/import/tt
/app/import/shipments
/app/customs/landed-cost
```

Show:

- Supplier inquiry to PO.
- PI approval.
- LC and TT records.
- Shipment BL/container/vessel/ETA.
- Landed-cost table seeded from the workbook.
- Landed Cost Preview calculator.
- Record drawer with workflow actions and document archive.

Talk track:

> The landed cost formula includes import value, freight, insurance, duty, VAT, AIT, port, C&F, transport and approved expenses. The result becomes the true product cost before stock enters the warehouse.

### 4. Warehouse and Inventory

Routes:

```text
/app/warehouse/grn
/app/inventory/stock
/app/inventory/batches
/app/inventory/movements
/app/inventory/physical-counts
```

Show:

- GRN with rejected quantity, batch, LOT, expiry and BIN.
- Real-time stock.
- Batch/LOT tracking.
- Stock movement ledger.
- Physical count and variance approval.
- FEFO/expiry alert fields.

Talk track:

> This is built for medical consumables, so batch, LOT, expiry, FEFO and traceability are first-class controls.

### 5. Sales, CRM and Mobile Sales Control

Routes:

```text
/app/customers
/app/sales/quotations
/app/sales/orders
/app/sales/challans
/app/sales/invoices
/app/sales/collections
/app/sales/returns
/app/sales/visits
/app/sales/targets
/app/sales/mobile-control
```

Show:

- Customer/CRM master.
- Quotation to order to challan to invoice to collection.
- Sales returns.
- Visit logs.
- Target and commission screen.
- Mobile Sales Control mock with GPS check-in, OpenStreetMap route tracking, offline queue, order entry, collection entry and manager sync.

Important role test:

1. Logout.
2. Login as `sales1@mipro.local`.
3. Open Sales Invoices.
4. Show that only own invoices are visible.
5. Show that landed cost, purchase cost and profit fields are hidden.
6. Try Accounts route and show access denied.

Talk track:

> Sales privacy is enforced. Field sales users see only their own customers and documents. They do not see company-wide sales, purchase cost, landed cost or profit.

### 6. Accounts and Finance

Routes:

```text
/app/accounts/vouchers
/app/accounts/receivables
/app/accounts/payables
/app/accounts/cash-book
/app/accounts/bank-book
/app/accounts/general-ledger
```

Show:

- Journal, contra, payment and receipt vouchers.
- Receivable aging.
- Supplier payables.
- Cash book.
- Bank book.
- General ledger.
- Posting workflow.

Talk track:

> Finance data is connected to sales collections, import cost and management reports. Posting remains controlled by authorized roles.

### 7. HR, Payroll, Expense and Transport

Routes:

```text
/app/expenses
/app/hr/employees
/app/hr/attendance
/app/hr/leave-advances
/app/hr/payroll
/app/transport
```

Show:

- Employee master.
- Attendance and leave.
- Salary advance/loan placeholder.
- Payroll and payslip print view.
- Expense management.
- Vehicle/trip/fuel/delivery cost.

### 8. Reports and Decision Intelligence

Route:

```text
/app/reports
```

Show:

- Daily, weekly, monthly and operational report library.
- P&L preview.
- Balance sheet preview.
- Cash flow preview.
- Operational trace preview.
- Chart and drill-down table.
- Export and print actions.

### 9. AI Command Center and Floating AI

Routes:

```text
/app/ai
```

Also use the floating assistant.

Show:

- Import document extraction agent.
- Landed cost calculation agent.
- Inventory risk agent.
- Sales/collection risk agent.
- Finance reconciliation agent.
- Management insight agent.
- Human approval required.

Ask the floating AI as Sales Executive:

```text
Show my sales summary
```

Expected behavior:

- It answers only from scoped own data.
- It says purchase cost, landed cost and profit are hidden for sales privacy.

### 10. Security, Roles and Settings

Routes:

```text
/app/roles
/app/audit
/app/settings
/app/profile
```

Show:

- Role permission matrix.
- User-level permission toggles.
- Audit log and login activity.
- 2FA/IP restriction/backup/document archive placeholders.
- Functional settings for company, warehouse, barcode/QR/UDI, approval, tax, print, AI and API/mobile sync.
- Profile edit and avatar.

## Requirement Coverage

| Requirement | Status |
|---|---|
| Web ERP frontend | Complete functional prototype |
| Role-based login/logout | Complete |
| Role-based navbar and route guards | Complete |
| Sales Executive own-data scoping | Complete |
| Hide cost/profit from sales roles | Complete |
| User-level permission toggles | Complete frontend mock |
| Multi-company/company scope | Complete frontend/API mock |
| Procurement inquiry | Complete |
| PI, PO, LC, TT | Complete |
| Shipment tracking | Complete |
| Customs landed-cost calculator | Complete |
| Document archive | Complete frontend mock |
| GRN receiving | Complete |
| BIN, batch, LOT, expiry | Complete |
| FEFO and expiry alerts | Complete |
| Physical count and variance | Complete |
| CRM customers | Complete |
| Quotation/order/challan/invoice/collection | Complete |
| Sales return | Complete |
| Visit logs and mobile GPS tracking | Complete frontend with OpenStreetMap route view |
| Sales targets and commission | Complete |
| Cash book, bank book, GL, vouchers | Complete |
| Receivables and payables | Complete |
| P&L, balance sheet, cash flow previews | Complete |
| Expense management | Complete |
| HR employees, attendance, leave/advance, payroll | Complete |
| Transport trips/fuel/delivery cost | Complete |
| Reports center | Complete |
| AI agents and role-aware AI chat | Complete frontend/mock API |
| Audit/security/settings/profile | Complete |
| `/api/v1` backend-ready routes | Complete |
| Vercel deployment files | Complete |

## Backend-Ready Notes

- Frontend screens call API endpoints, not local fixtures.
- The Express mock API can be replaced by a real backend later.
- `/api/v1` aliases are available for backend contract alignment.
- Role, user, company and scope headers are sent from the frontend.
- CRUD and workflow actions persist for the current mock API process.
- Real production work still needs database persistence, file storage, real authentication, real AI integration and production mobile app packaging.

## Vercel Deployment After GitHub Push

1. Run local verification before pushing:

```bash
npm run lint
npm run build
npm run smoke
```

2. Commit and push the latest code:

```bash
git status
git add package.json package-lock.json index.html vite.config.ts tsconfig*.json eslint.config.js vercel.json api server src public scripts README.md PRESENTATION.md
git commit -m "Finalize Mipro ERP frontend prototype"
git push origin main
```

3. In Vercel, import the GitHub repository and use:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: project root
Environment Variables: none required for this mock prototype
```

4. Deploy and test:

```text
/
/login
/app/dashboard
/app/sales/mobile-control
/api/health
/api/v1/dashboard/summary
```

The repo already includes `api/index.ts`, `api/[...path].ts`, and `vercel.json`. The frontend uses relative `/api/*` calls, so the same Vercel project can serve the Vite app and the Express mock API.

## Presentation Wording

Use this wording:

> This is a functional frontend prototype with a mock backend API. It demonstrates the complete workflow, access control, privacy rules, forms, tables, filters, print/export actions, workflow approvals, document archive, AI assistance and backend-ready API boundaries. Once the project is approved, the mock API can be replaced by the production backend and database.

Avoid saying:

```text
This is only static UI.
```

Avoid promising:

```text
Real database, production authentication, real GPS, real file storage or real AI are already live.
```

## Verification

Last verification commands:

```bash
npm run lint
npm run build
npm run smoke
```

Expected result:

- Lint passes.
- Production build passes.
- Smoke test walks all core routes, Sales Executive privacy, access denied, AI scoping and `/api/v1` endpoints.

## Best Closing Line

> We have already modeled your real import-to-accounts workflow, including landed cost, batch/expiry traceability, role privacy and management reporting. The next step is confirming final business rules and replacing the mock API with the production backend.
