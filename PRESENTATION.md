# Mipro HealthCare ERP Presentation Guide

## Purpose

This document is the presenter guide for the Mipro HealthCare ERP frontend prototype. It explains how the system connects departments, what data enters each module, where that data flows next, who can create/edit/delete records, who approves or posts transactions, and how to demonstrate the system clearly to the client.

This is a functional frontend prototype with a mock API. It is not a static UI. Screens load through `/api/*` endpoints, role-based navigation is enforced, records can be created/edited/deleted where allowed, workflow actions change record status, Sales Executive data is scoped to own records, and sensitive cost/profit fields are hidden by role.

## Source Priority

1. Primary requirement: `files/Project_Requirements_Presentation.pdf`
2. Seed data and formulas: `files/Mipro HealthCare Corp.xlsx`
3. Background context: `files/Project_Meeting_Minutes.pdf`
4. Older base plans: `files/Medical_Supplier_ERP_Plan.pdf` and `files/Medical_Supplier_ERP_Plan_Details.pdf`

Important: the meeting-minute idea about altered/fake company data should not be presented. The prototype supports legitimate company/branch scope and can support a clearly marked sandbox company later.

## Demo Access

Live URL:

```text
https://medical-supplier-erp.vercel.app
```

Local frontend:

```text
http://localhost:5173
```

Local mock API:

```text
http://localhost:4174
```

All demo users use:

```text
password123
```

| Role | Email | Main Demo Purpose |
|---|---|---|
| Super Admin | `superadmin@mipro.local` | Full system control, users, roles, settings, audit, all modules |
| Managing Director | `md@mipro.local` | Executive dashboard, approvals, P&L, bank, reports |
| Accounts | `accounts@mipro.local` | Vouchers, cash book, bank book, GL, receivables, payables, payroll |
| Import Officer | `import@mipro.local` | Supplier inquiry, PI, PO, LC/TT, shipment, customs, landed cost |
| Warehouse Manager | `warehouse@mipro.local` | GRN, stock, batches, movements, physical count, FEFO |
| Sales Manager | `salesmanager@mipro.local` | Team sales, customer oversight, targets, discounts, collections |
| Sales Executive | `sales1@mipro.local` | Own customers, own sales documents, own visits, own collections only |

## One-Sentence Positioning

This is a connected medical import and distribution ERP that carries data from supplier inquiry to landed cost, warehouse stock, hospital sales, collection, accounts, management reports, AI recommendations and audit trail without duplicate manual entry.

## How To Explain The System Simply

Use this explanation for non-technical people:

> Think of each screen as a department desk. The department fills a form, presses save, and the system sends that data to the central ERP service. The next department does not retype it. They receive the approved record, add their own part, and pass it forward.

Use this explanation for the API:

> An API is the controlled communication line between the screen and the company data. When I open the dashboard, the screen asks the API for dashboard numbers. When I save a PO, the screen sends the PO data to the API. In this prototype the API is mocked for presentation, but the frontend already talks through real API-style endpoints, so the production database can be connected later without rebuilding every screen.

Use this explanation for role security:

> The user role is sent with every request. The API and frontend both use that role to decide what menu items, records, buttons and sensitive fields should be visible.

Use this explanation for temporary demo data:

> For the presentation, saved records remain in the mock API runtime. It proves the forms, actions and workflow behavior. In production, the same API calls will write to permanent database tables with audit logs, backup and row-level security.

Avoid saying:

```text
This is just static design.
```

Say instead:

```text
This is a working frontend prototype connected to a mock ERP API. The production phase replaces the mock storage with a real backend and database.
```

## What Happens When You Click

This is the easiest mental model for presenting the frontend:

| User Action | What The User Sees | What The System Does | API Style |
|---|---|---|---|
| Open landing page | Public product-style ERP introduction | No login required; shows positioning and key modules | Static frontend route `/` |
| Login | Role-based account starts | Sends email/password, receives session token and role | `POST /api/auth/login` |
| Open dashboard | KPIs, charts, alerts, pipeline | Sends role headers, returns role-safe dashboard data | `GET /api/dashboard` |
| Open a module table | Searchable operational list | Fetches records for that module and filters by role/company | `GET /api/<module>` |
| Open record details | Drawer with fields, workflow and documents | Uses selected row data and document archive | `GET /api/documents` plus module data |
| Create record | Form modal opens, save button stores draft | Sends new form payload to mock API | `POST /api/<module>` |
| Edit record | Existing data opens in form | Sends changed fields to mock API if role and status allow | `PATCH /api/<module>/:id` |
| Delete record | Row disappears after permission check | Sends delete command only if role/status allows | `DELETE /api/<module>/:id` |
| Submit | Status changes to pending approval | Workflow action changes record status | `POST /api/<module>/:id/submit` |
| Approve | Status changes to approved | Approval action is recorded by authorized role | `POST /api/<module>/:id/approve` |
| Post | Status changes to posted | Finance/stock effect is treated as finalized in demo | `POST /api/<module>/:id/post` |
| Print document | Print-ready page opens | Opens template using module key and record id | `/app/print/:template/:moduleKey/:id` |
| Ask AI | Bottom-right floating chat answers using role context | Sends question and current role, returns scoped answer | `POST /api/ai/chat` |

Presenter line:

> I am not only clicking screens. Each click represents a real ERP transaction: view, create, edit, approve, post, print, or audit.

## Full Data Flow

```text
Master Data
  -> Supplier Inquiry
  -> PI
  -> Purchase Order
  -> LC / TT
  -> Shipment
  -> Customs & Landed Cost
  -> GRN
  -> Batch / LOT / BIN Inventory
  -> Quotation
  -> Sales Order
  -> Delivery Challan
  -> Sales Invoice
  -> Collection
  -> Voucher / Cash Book / Bank Book / GL
  -> Receivable / Payable / P&L / Balance Sheet / Cash Flow
  -> Dashboard / Reports / AI / Audit
```

The important story: every department adds its part, and the next department receives structured data instead of retyping spreadsheets.

## Core Record Handoffs

| Stage | Main Data Entered | Created By | Approved / Posted By | Used By Next | Business Result |
|---|---|---|---|---|---|
| Company, branch, warehouse, BIN | Company profile, branches, warehouse capacity, BIN code | Super Admin | Super Admin | All modules | Operating structure is ready |
| Product / SKU | Product code, category, unit, brand, manufacturer, purchase/sales price, image | Super Admin or Import Officer | Super Admin / MD for final master policy | Procurement, inventory, sales | One SKU master for import, stock and sales |
| Supplier | Supplier country, contact, product category, payment terms, rating | Import Officer | Super Admin / MD if required | Inquiry, PI, PO, LC/TT | Approved supplier base |
| Customer / CRM | Hospital/clinic/dealer/pharmacy, credit limit, territory, sales owner | Sales Manager or Sales Executive | Sales Manager for credit/territory control | Quotation, invoice, collection, visits | Customer record and ownership |
| Supplier Inquiry | Supplier, product, requested qty, target price | Import Officer | Import Officer / MD review | PI and PO | Procurement starts from a traceable request |
| PI | PI number, supplier, product, amount, currency, approval owner | Import Officer | Managing Director | PO, LC/TT | Supplier commercial offer approved |
| Purchase Order | PO number, supplier, products, qty, currency, exchange rate, total value | Import Officer | Managing Director | LC/TT, shipment, landed cost | Confirmed overseas order |
| LC / TT | Bank, LC/TT number, amount, expiry, shipment date, Swift copy | Import Officer / Accounts | Managing Director and Accounts | Shipment and payables | Payment instrument tracked |
| Shipment | BL, container, vessel, ETD, ETA, supplier, PO reference | Import Officer | Import Officer updates status | Customs and warehouse | Goods in transit are visible |
| Customs / Landed Cost | FOB, freight, duty, VAT, AIT, C&F, transport, insurance, total landed cost | Import Officer | Managing Director / Accounts review | GRN, stock valuation, profit reports | True cost per product is calculated |
| GRN | Received qty, rejected qty, batch, LOT, expiry, BIN, warehouse | Warehouse Manager | Warehouse Manager posts; Super Admin override | Stock, batch ledger, movements | Inventory is officially received |
| Batch / LOT / BIN | Batch number, LOT, expiry date, FEFO rank, BIN location | Warehouse Manager | Warehouse Manager | Sales issue, recall, expiry alerts | Medical traceability is preserved |
| Stock Movement | Stock in/out, transfer, adjustment, sale, return | Warehouse Manager | Warehouse Manager posts | Stock reports, audit | Inventory movement ledger |
| Physical Count | System qty, counted qty, variance | Warehouse Manager | Warehouse Manager / MD for large variance | Adjustment and audit | Stock accuracy check |
| Quotation | Customer, product, quantity, unit price, discount | Sales Executive / Sales Manager | Sales Manager or MD for discount | Sales Order | Price offer controlled |
| Sales Order | Confirmed customer order and amount | Sales Executive / Sales Manager | Sales Manager | Delivery Challan and warehouse dispatch | Sales demand confirmed |
| Delivery Challan | Order reference, delivery date, vehicle, status | Sales / Warehouse / Transport | Warehouse Manager or Sales Manager | Invoice and transport cost | Delivery proof |
| Sales Invoice | Customer, product, qty, unit price, revenue, tax/profit fields | Sales Executive / Sales Manager | Accounts posts financial effect | Receivable, collection, GL | Customer billing |
| Collection | Receipt, invoice, customer, amount, method | Sales Executive / Sales Manager / Accounts | Accounts posts | Cash book, bank book, voucher | Money received and matched |
| Voucher | Journal, contra, payment, receipt voucher | Accounts | Accounts posts; MD can review | GL, cash/bank, P&L | Accounting entry |
| Payables | Supplier due date, amount, currency | Accounts / Import | Accounts posts, MD reviews | Bank planning | Supplier liability visibility |
| Expenses | Rent, utility, fuel, TA/DA, salary, marketing, maintenance | Accounts | Accounts posts; MD review if needed | P&L and cash/bank | Expense control |
| HR / Payroll | Employees, attendance, leave, salary, advance, payslip | Accounts / HR role in production | Accounts posts payroll | Expense, cash/bank, reports | Back-office payroll workflow |
| Transport | Vehicle, driver, trip, fuel, delivery cost | Transport/Admin role in production; Super Admin demo | Accounts posts cost allocation | Delivery cost and P&L | Delivery cost visibility |
| Reports / Dashboard | Aggregated sales, stock, bank, receivable, payable, profit | System generated | Viewed by authorized roles | Management decisions | Real-time decision intelligence |
| AI Recommendations | Risks, extracted fields, expiry, reconciliation, collection warnings | System generated | Human approves/rejects | Relevant module action | Assisted control, not automatic posting |
| Audit Log | User, role, action, module, record, IP/device | System generated | Super Admin monitors | Compliance | Who did what, when and where |

## Approval Model

The prototype uses a generic workflow action model:

```text
Draft -> Submit -> Pending Approval -> Approve / Reject -> Approved -> Post -> Posted
```

Some operational records use additional statuses:

```text
Ready, Delivered, Cancelled, Shipped, Customs, Cleared, Warehouse Received,
Normal, Low Stock, Hold, Expired, Reconciled
```

Presenter explanation:

> Each department can prepare its own transaction, but sensitive steps such as purchase approval, landed cost approval, voucher posting and finalized data changes are controlled by authorized roles.

## Who Inputs, Approves, Posts and Deletes

| Role | Inputs / Creates | Edits | Deletes | Approves / Posts | Cannot See / Cannot Do |
|---|---|---|---|---|---|
| Super Admin | All setup and all module records | All records, including finalized demo records | All records in demo, including override | Can approve/post/export in every module | No restrictions in prototype |
| Managing Director | Mainly review notes and executive approvals | Limited executive edits depending on module | No routine delete | Approves procurement, PI, PO, landed cost, sales/discount exceptions, AI recommendations | Does not manage daily data entry |
| Accounts | Vouchers, receivables, payables, cash book, bank book, GL, expenses, payroll | Draft finance and payroll entries | No routine delete in current matrix | Posts vouchers, cash/bank entries, payroll, expenses | Cannot access import/warehouse operational entry screens except read-only summaries |
| Import Officer | Suppliers, inquiries, PI, PO, LC, TT, shipments, customs/landed cost drafts | Import/procurement/shipment/customs drafts | Can delete allowed non-finalized import records | Can submit/prepare approvals; MD/Accounts review final sensitive steps | Cannot post accounts or change finalized finance |
| Warehouse Manager | GRN, BIN, stock movements, batches, physical counts | Warehouse/inventory drafts and operational stock records | No routine delete in current matrix | Posts GRN, stock movements, physical count workflow | Cannot see full accounts or sales profit |
| Sales Manager | Customers, quotations, orders, challans, invoices, returns, visits, targets | Sales/team records, non-finalized | Can delete allowed non-finalized sales records | Approves sales workflow, discounts, returns, collection oversight | Purchase cost, landed cost and profit fields are hidden |
| Sales Executive | Own customers, quotations, orders, invoices, collections, visits | Own non-finalized sales records | No delete permission in current matrix | Can submit own sales activity; manager/accounts approve/post | Cannot see other reps' records, company-wide sales, accounts, landed cost, purchase cost or profit |

Finalized lock rule:

- Approved, Posted, Delivered, Closed, Cancelled, Archived, Reconciled and Sent records are locked for normal users.
- Super Admin can override in the prototype.
- Production should enforce this in the database and audit every override.

## Privacy and Data Protection Story

The client specifically requested sales privacy. Demonstrate it live:

1. Login as `superadmin@mipro.local`.
2. Open `/app/sales/invoices`.
3. Show all invoices and profit/cost fields.
4. Logout.
5. Login as `sales1@mipro.local`.
6. Open `/app/sales/invoices`.
7. Show only own invoices.
8. Confirm purchase cost, landed cost and profit are hidden.
9. Try `/app/accounts/vouchers`.
10. Show access denied.

Talk track:

> Sales executives can continue working with customers, orders, invoices, visits and collections, but management-sensitive margin and company-wide information remains protected.

## Module Connections

### Master Data

Master data is the foundation. Products, suppliers, customers, warehouses, BINs, users and roles feed every later transaction.

Data goes to:

- Supplier and product data flow into inquiry, PI, PO, customs and landed cost.
- Product and warehouse data flow into GRN, batches, stock and sales.
- Customer and territory data flow into quotation, invoice, visits, targets and receivables.
- User roles control screens, actions and field visibility.

### Import and Procurement

Import Officer starts the procurement cycle:

```text
Supplier Inquiry -> PI -> PO -> LC/TT -> Shipment -> Customs
```

MD approves commercial commitments such as PI/PO and landed cost. Accounts is involved where payment, bank, LC/TT or payable impact exists.

Key demo data from Excel:

- PO: `PO-2026-001`
- Consignment: `CN-9982`
- LC: `LC-77612`
- Products: `Mip001`, `Mip002`, `Mip003`

### Landed Cost

Formula shown in the prototype:

```text
Product Import Value
+ Freight
+ Insurance
+ Duty
+ VAT
+ AIT
+ Port Charges
+ C&F Charges
+ Transport Charges
+ Other Approved Expenses
= Total Landed Cost
```

Landed cost goes to:

- Inventory valuation
- Unit COGS
- Margin preview
- Profit and loss reporting
- Sales privacy redaction

### Warehouse and Inventory

Warehouse receives goods after customs:

```text
Customs Cleared -> GRN -> Batch / LOT / BIN -> Stock -> Movements -> Physical Count
```

Warehouse Manager enters:

- Received quantity
- Rejected quantity
- Batch number
- LOT number
- Expiry date
- BIN location
- Warehouse

The system then supports:

- FEFO issue recommendation
- 6-month, 3-month and 1-month expiry alerts
- Stock movement ledger
- Recall-ready batch traceability
- Physical count variance review

### Sales, CRM and Mobile Sales

Sales starts from customer and CRM activity:

```text
Customer -> Visit -> Quotation -> Sales Order -> Challan -> Invoice -> Collection
```

Sales Executive can input own customer activity. Sales Manager can oversee team activity, targets and approvals.

Mobile Sales Control shows:

- Own customer list
- GPS check-in
- OpenStreetMap route tracking
- Order entry mock
- Collection entry mock
- Visit remarks
- Offline queue
- Manager sync

Sales data goes to:

- Warehouse delivery planning
- Receivables
- Cash/bank collection
- Sales target achievement
- Commission preview
- Dashboard and reports

### Accounts and Finance

Accounts receives financial impact from sales, import and expenses:

```text
Invoice -> Receivable
Collection -> Receipt Voucher -> Cash Book / Bank Book
Supplier Due -> Payable -> Payment Voucher -> Bank Book
Expense -> Voucher -> GL
Payroll -> Payslip -> Expense / Cash / Bank
```

Accounts can create and post finance records. MD can view executive finance summaries. Sales Executive cannot access accounts.

Reports generated:

- P&L snapshot
- Balance sheet preview
- Cash flow preview
- Receivables aging
- Payables position
- Bank balance
- Inventory valuation

### HR, Payroll, Expense and Transport

These are included because the refined requirement mentions back-office operations.

Data links:

- Attendance and leave affect payroll readiness.
- Payroll becomes salary expense.
- Fuel and trip cost become transport/delivery expense.
- Transport can relate to delivery challans.
- Expenses appear in finance reports and cash/bank ledgers after posting.

### Reports, Dashboard and AI

Reports are not separate data entry. They consume data from all modules.

Dashboard shows:

- Today sales
- Monthly sales
- Gross margin
- Net profit
- Bank balance
- Receivables
- Payables
- Inventory valuation
- Import pipeline
- Expiry alerts
- Target vs achievement
- AI executive summary

AI agents assist with:

- Import document extraction
- Landed cost validation
- Expiry and FEFO risk
- Collection risk
- Finance reconciliation
- Executive insight

Important presentation line:

> AI suggests and explains; authorized humans still approve, post and take responsibility.

AI locations in the UI:

- Bottom-right floating chat: always available after login and answers using the current signed-in role.
- `/app/ai`: full AI Agents page with recommendations, approve/reject actions and module-specific AI controls.

## A-to-Z Presentation Script

Use this order when you need to explain the whole system clearly from start to finish.

### Step 1: Company Control

Show:

```text
/app/master/companies
/app/master/warehouses
/app/warehouse/bin-locations
/app/users
/app/roles
```

Say:

> Before daily work starts, the company defines branches, warehouses, BIN locations, users and roles. This controls where stock is stored, which branch/company owns the data, and who can access each operation.

Data created here:

- Company and branch
- Warehouse and BIN
- Users and roles
- Permission matrix

Data used by:

- Product stock
- GRN
- Sales territory
- User access control
- Audit and reports

### Step 2: Product, Supplier and Customer Foundation

Show:

```text
/app/products
/app/suppliers
/app/customers
```

Say:

> Products, suppliers and customers are master data. Once they are created correctly, the same product and party information flows into import, stock, sales and accounts.

Data created here:

- Product code, name, category, price, reorder level and image
- Supplier country, payment terms and rating
- Customer type, territory, credit limit and assigned sales executive

Approver/control:

- Super Admin controls master setup.
- MD may review policy-level product/supplier decisions.
- Sales Manager controls territory/customer ownership.

### Step 3: Import Starts From Inquiry

Show:

```text
/app/procurement/inquiries
/app/import/pi
/app/procurement/purchase-orders
```

Say:

> Import starts before the shipment. The Import Officer records supplier inquiry, PI and purchase order. MD approval is needed before the company commits to major purchase value.

Data created here:

- Supplier inquiry
- PI
- PO
- Product quantity and commercial value
- Currency and exchange rate

Approver/control:

- Import Officer inputs.
- Managing Director approves PI/PO.
- Accounts will later use this for payable and bank planning.

### Step 4: Payment and Shipment Tracking

Show:

```text
/app/import/lc
/app/import/tt
/app/import/shipments
```

Say:

> After PO approval, the payment method and shipment are tracked. LC/TT connects import with bank/accounting, and shipment connects import with customs and warehouse receiving.

Data created here:

- LC or TT number
- Bank and amount
- Swift copy reference
- BL, container, vessel, ETD, ETA
- Shipment status

Approver/control:

- Import Officer updates shipment data.
- Accounts/MD review financial exposure.
- Warehouse uses ETA and container reference for receiving.

### Step 5: Customs and Landed Cost

Show:

```text
/app/customs/landed-cost
```

Say:

> Landed cost is one of the most important controls. It converts overseas purchase price into true local product cost by adding freight, insurance, duty, VAT, C&F, transport and bank/LC cost.

Data created here:

- FOB cost
- Freight
- Duty, VAT, AIT
- C&F and port charges
- Local transport
- Per-unit landed cost
- Margin preview

Approver/control:

- Import Officer prepares the cost.
- MD or Accounts reviews before it affects valuation.
- Sales roles cannot see sensitive cost/profit fields.

API call to mention:

```text
POST /api/v1/customs/landed-cost-preview
```

### Step 6: Warehouse Receiving and Batch Control

Show:

```text
/app/warehouse/grn
/app/inventory/stock
/app/inventory/batches
/app/inventory/movements
/app/inventory/physical-counts
```

Say:

> Once customs is cleared, warehouse receives the goods through GRN. Medical product traceability starts here: batch number, LOT, expiry date and BIN location are captured before sale.

Data created here:

- GRN
- Received and rejected quantity
- Batch and LOT
- Expiry date
- BIN location
- Stock movement
- Physical count variance

Approver/control:

- Warehouse Manager posts GRN and stock movements.
- Super Admin can override in demo.
- Large variances should be reviewed by management in production.

### Step 7: Sales and CRM

Show:

```text
/app/customers
/app/sales/visits
/app/sales/quotations
/app/sales/orders
/app/sales/challans
/app/sales/invoices
/app/sales/collections
/app/sales/returns
/app/sales/targets
```

Say:

> Sales starts from customer relationship work. A field user can visit a hospital, create a quotation, convert it to order, deliver by challan, invoice the customer and record collection.

Data created here:

- Visit log and GPS-ready check-in
- Quotation
- Sales order
- Delivery challan
- Invoice
- Collection receipt
- Sales return
- Target and commission data

Approver/control:

- Sales Executive inputs own activity only.
- Sales Manager reviews team activity and discounts.
- Accounts posts financial collection impact.
- Sales Executive cannot see other salespeople's data or company profit.

### Step 8: Accounts and Finance

Show:

```text
/app/accounts/receivables
/app/accounts/payables
/app/accounts/vouchers
/app/accounts/cash-book
/app/accounts/bank-book
/app/accounts/general-ledger
/app/expenses
```

Say:

> Accounts receives the financial impact from import, sales, collection, expense and payroll. The goal is not double entry by every department. Operational records create the basis for receivable, payable, voucher, cash, bank and ledger control.

Data created here:

- Receivables and aging
- Supplier payables
- Receipt/payment/journal/contra vouchers
- Cash book
- Bank book
- General ledger
- Expenses

Approver/control:

- Accounts creates and posts finance entries.
- MD reviews executive finance and exceptions.
- Sales and warehouse do not get full accounts access.

### Step 9: HR, Payroll and Transport

Show:

```text
/app/hr/employees
/app/hr/attendance
/app/hr/leave-advances
/app/hr/payroll
/app/transport
```

Say:

> The refined requirement also includes back-office operations. HR and payroll support salary control. Transport supports delivery cost, fuel and vehicle movement.

Data created here:

- Employees
- Attendance and leave
- Salary advance/loan request
- Payroll
- Vehicle/trip/fuel/delivery cost

Data used by:

- Expenses
- Cash/bank
- P&L
- Delivery cost review

### Step 10: Reports, AI and Audit

Show:

```text
/app/reports
/app/ai
/app/audit
/app/settings
/app/profile
```

Say:

> Reports and AI do not replace human approval. They summarize the connected ERP data so management can see risk, profit, stock, dues and operational status. Audit keeps a trace of sensitive actions.

Data shown here:

- P&L, balance sheet and cash flow previews
- Sales, collection and target reports
- Inventory valuation and expiry alerts
- AI recommendations
- Login and action audit trail
- Profile and security placeholders

Approver/control:

- MD and Super Admin see the widest intelligence view.
- Sales Executive AI answers are scoped to own permissions.
- Super Admin monitors audit and settings.

## Recommended Demo Path

### 1. Start With Landing Page

Route:

```text
/
```

Say:

> This is not a generic ERP landing page. It is positioned around medical device import, landed cost, warehouse batch traceability, sales control, accounts and management reporting.

### 2. Login as Super Admin

Route:

```text
/login
```

Show:

- Role-based sign-in
- Demo account list
- No role switcher inside the app

### 3. Executive Dashboard

Route:

```text
/app/dashboard
```

Show Mipro workbook numbers:

- BDT 3,970,000 sales revenue
- BDT 1,286,145 inventory valuation
- 17,500 units in stock
- Import pipeline and expiry alerts

### 4. Import-to-Warehouse Flow

Routes:

```text
/app/procurement/inquiries
/app/import/pi
/app/procurement/purchase-orders
/app/import/lc
/app/import/shipments
/app/customs/landed-cost
/app/warehouse/grn
/app/inventory/stock
/app/inventory/batches
```

Demo actions:

- Open a PO record.
- Show workflow actions.
- Show document archive.
- Open landed cost calculator.
- Show GRN with batch/LOT/expiry/BIN.
- Show stock and batch alerts.

### 5. Sales-to-Accounts Flow

Routes:

```text
/app/customers
/app/sales/quotations
/app/sales/orders
/app/sales/challans
/app/sales/invoices
/app/sales/collections
/app/accounts/receivables
/app/accounts/vouchers
/app/accounts/cash-book
/app/accounts/bank-book
```

Demo actions:

- Create or open a quotation.
- Explain conversion to order, challan and invoice.
- Show collection posting.
- Show receivable aging.
- Show voucher/cash/bank connection.

### 6. Mobile Sales Control

Route:

```text
/app/sales/mobile-control
```

Show:

- GPS check-in
- Map/route tracking
- Visit evidence
- Offline queue
- Manager team table
- Order, collection and visit mock actions

### 7. Role Privacy Test

Login:

```text
sales1@mipro.local
password123
```

Show:

- Own customers only
- Own invoices only
- No landed cost/profit fields
- Accounts route blocked
- AI answer scoped to own data

### 8. Reports, AI and Audit

Routes:

```text
/app/reports
/app/ai
/app/audit
/app/roles
/app/settings
```

Show:

- Report library
- P&L, balance sheet, cash flow previews
- AI recommendations with approve/reject
- Bottom-right floating AI chat for role-aware questions
- Audit log
- Role matrix
- User-level permission toggles
- 2FA/IP/backup/document settings placeholders

## CRUD and Temporary Data Behavior

The prototype supports functional frontend CRUD:

- Create records
- Edit allowed records
- Delete where role permits
- Submit/approve/reject/post/cancel workflow actions
- Search, filter, export and print

Current limitation:

- Data persists only in the current mock API process.
- There is no production database yet.
- Production backend should store all records in a database with audit and row-level permissions.

Presenter wording:

> The forms and workflows are functional for prototype validation. In production, the same API contracts will connect to persistent database tables, file storage and real authentication.

## Backend-Ready API Boundary

Frontend screens call API endpoints rather than importing fixtures directly. This is important because the prototype is not locked into fake hardcoded page data. The backend can be replaced later while keeping the same frontend screens and user workflows.

Simple architecture:

```text
User clicks frontend screen
  -> React component calls apiClient
  -> apiClient sends request to /api/*
  -> request includes session token, user id, role and company id headers
  -> Express mock API checks role/company visibility
  -> API returns JSON
  -> React Query refreshes the table, dashboard, chart or drawer
```

Important request headers:

| Header | Meaning | Why It Matters |
|---|---|---|
| `Authorization` | Demo bearer token from login | Production backend will verify real authentication |
| `x-user-id` | Current signed-in user id | Used for own-data filtering, especially Sales Executive |
| `x-role` | Current role | Used for route, action and field visibility |
| `x-company-id` | Active company scope | Allows future multi-company or branch separation |

Standard response shape:

```json
{
  "success": true,
  "message": "OK",
  "data": []
}
```

Important endpoint examples:

```text
POST /api/auth/login
GET /api/auth/demo-users
GET /api/dashboard
GET /api/products
GET /api/customers
GET /api/imports/pipeline
GET /api/customs/landed-cost
POST /api/v1/customs/landed-cost-preview
GET /api/inventory/stock
GET /api/sales/invoices
GET /api/accounts/vouchers
GET /api/reports/summary
POST /api/ai/chat
```

The API accepts both `/api/...` and `/api/v1/...` style paths. The `/api/v1/...` paths show the future production contract. The mock server normalizes them internally for this prototype.

## API Endpoint Map By Business Area

| Business Area | Frontend Routes | API Calls | What Data Moves |
|---|---|---|---|
| Authentication | `/login`, `/signup`, `/forgot-password`, `/reset-password` | `POST /api/auth/login`, `GET /api/auth/demo-users`, `POST /api/auth/signup-request`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `GET /api/me` | User session, requested role, password reset demo state |
| Dashboard | `/app/dashboard` | `GET /api/dashboard` and `GET /api/v1/dashboard/summary` | KPIs, sales, stock, bank, receivable, payable, import pipeline, expiry alerts, AI summary |
| User and Role Control | `/app/users`, `/app/roles` | `GET/POST/PATCH/DELETE /api/users` | Users, roles, department, active/inactive status, role matrix presentation |
| Company Setup | `/app/master/companies` | `GET/POST/PATCH/DELETE /api/companies` | Company, branch and operating scope |
| Warehouse Setup | `/app/master/warehouses`, `/app/warehouse/bin-locations` | `GET/POST/PATCH/DELETE /api/warehouses`, `GET/POST/PATCH/DELETE /api/bin-locations` | Warehouse locations, capacity, BIN code, zone |
| Product Master | `/app/products` | `GET/POST/PATCH/DELETE /api/products` | Product code, name, category, unit, brand, manufacturer, image, purchase/sales price, reorder level |
| Supplier Master | `/app/suppliers` | `GET/POST/PATCH/DELETE /api/suppliers` | Supplier country, contact, product category, payment terms, rating |
| Customer CRM | `/app/customers` | `GET/POST/PATCH/DELETE /api/customers` | Hospital/clinic/dealer/pharmacy details, territory, credit limit, assigned sales executive |
| Supplier Inquiry | `/app/procurement/inquiries` | `GET/POST/PATCH/DELETE /api/supplier-inquiries` | Supplier request, product, quantity, target price, negotiation status |
| Purchase Order | `/app/procurement/purchase-orders` | `GET/POST/PATCH/DELETE /api/purchase-orders`, `POST /api/purchase-orders/:id/approve` | PO number, supplier, product, quantity, currency, exchange rate, total value, approval status |
| PI | `/app/import/pi` | `GET/POST/PATCH/DELETE /api/proforma-invoices` | PI number, supplier, product, amount, currency, approval owner |
| LC | `/app/import/lc` | `GET/POST/PATCH/DELETE /api/lc-records` | LC number, bank, amount, expiry, shipment date |
| TT Payment | `/app/import/tt` | `GET/POST/PATCH/DELETE /api/tt-payments` | TT number, supplier, amount, Swift copy reference, approval status |
| Shipment | `/app/import/shipments` | `GET/POST/PATCH/DELETE /api/shipments` | BL, container, vessel, ETD, ETA, PO reference, shipment status |
| Customs and Landed Cost | `/app/customs/landed-cost` | `GET/POST/PATCH/DELETE /api/customs/landed-cost`, `POST /api/v1/customs/landed-cost-preview` | FOB, freight, insurance, duty, VAT, C&F, transport, bank/LC cost, per-unit landed cost, margin preview |
| GRN | `/app/warehouse/grn` | `GET/POST/PATCH/DELETE /api/grn`, `POST /api/grn/:id/post` | Received qty, rejected qty, batch, LOT, expiry, BIN, warehouse |
| Stock | `/app/inventory/stock` | `GET/POST/PATCH/DELETE /api/inventory/stock` and `GET /api/v1/inventory/batches` | Current stock, sold qty, landed cost, stock asset value, warehouse |
| Batches | `/app/inventory/batches` | `GET/POST/PATCH/DELETE /api/inventory/batches` | Batch, LOT, expiry, FEFO rank, BIN, quantity, expiry alert |
| Movements | `/app/inventory/movements` | `GET/POST/PATCH/DELETE /api/inventory/movements` and `GET /api/v1/inventory/movements` | Stock in/out, transfer, adjustment, sale, return |
| Physical Count | `/app/inventory/physical-counts` | `GET/POST/PATCH/DELETE /api/inventory/physical-counts` | System qty, counted qty, variance, approval status |
| Sales Quotation | `/app/sales/quotations` | `GET/POST/PATCH/DELETE /api/sales/quotations` | Customer, product, quantity, price, discount, conversion status |
| Sales Order | `/app/sales/orders` | `GET/POST/PATCH/DELETE /api/sales/orders` and `GET /api/v1/sales/orders` | Confirmed customer order, quantity, amount, order status |
| Delivery Challan | `/app/sales/challans` | `GET/POST/PATCH/DELETE /api/sales/challans` | Order, customer, delivery date, vehicle, delivery status |
| Sales Invoice | `/app/sales/invoices` | `GET/POST/PATCH/DELETE /api/sales/invoices` | Invoice, customer, product, sale price, revenue, hidden profit/cost fields by role |
| Collection | `/app/sales/collections` | `GET/POST/PATCH/DELETE /api/sales/collections` | Receipt, invoice, customer, collection date, amount, method |
| Sales Return | `/app/sales/returns` | `GET/POST/PATCH/DELETE /api/sales/returns` | Return number, invoice, product, quantity, reason, approval status |
| Visits and GPS | `/app/sales/visits`, `/app/sales/mobile-control` | `GET/POST/PATCH/DELETE /api/sales/visits` | Visit date, customer, check-in time, GPS lat/lng, accuracy, follow-up |
| Targets and Commission | `/app/sales/targets` | `GET/POST/PATCH/DELETE /api/sales/targets` | Sales rep, territory, monthly target, achieved amount, commission rate |
| Accounts | `/app/accounts/*` | `/api/accounts/vouchers`, `/api/accounts/receivables`, `/api/accounts/payables`, `/api/accounts/cash-book`, `/api/accounts/bank-book`, `/api/accounts/general-ledger` | Voucher, receivable, payable, cash, bank and GL records |
| Expenses | `/app/expenses` | `GET/POST/PATCH/DELETE /api/expenses` | Department expenses, category, amount, approval/posting status |
| HR and Payroll | `/app/hr/*` | `/api/employees`, `/api/payroll`, `/api/attendance`, `/api/hr/leave-advances` | Employee, attendance, leave, salary advance, payroll |
| Transport | `/app/transport` | `GET/POST/PATCH/DELETE /api/trips` | Vehicle, driver, trip, fuel cost, delivery cost |
| Reports | `/app/reports` | `GET /api/reports/summary` and `GET /api/v1/reports/summary` | P&L, balance sheet, cash flow, stock, sales, collection and management reports |
| AI | Bottom-right floating chat, `/app/ai` | `GET /api/ai/recommendations`, `POST /api/ai/recommendations/:id/approve`, `POST /api/ai/chat` | Role-aware recommendations, warnings, explanation and approval actions |
| Audit and Security | `/app/audit`, `/app/settings`, `/app/profile` | `GET /api/audit-logs`, `GET /api/login-activity` | User action history, login activity, security settings placeholders, profile data |

## How To Show API Calls In The Meeting

Use this only if the client asks "Is it really connected?" or if you want to show backend readiness.

1. Open the live site.
2. Press `F12` in the browser.
3. Open the `Network` tab.
4. Filter by `Fetch/XHR`.
5. Login with `superadmin@mipro.local`.
6. Click Dashboard, Products, Sales Invoices or Landed Cost.
7. Select one API request, such as `/api/dashboard`.
8. Show the `Response` tab.

Non-technical explanation while showing Network:

> This line is the screen asking for data. The response is JSON, which is the structured data format a real backend sends to the frontend. Today this comes from the mock API. In production, the same request will come from the database.

What to show:

```text
/api/auth/login              proves role-based login
/api/dashboard               proves dashboard is data-driven
/api/products                proves product table is API-loaded
/api/sales/invoices          proves sales and profit fields are controlled
/api/v1/customs/landed-cost-preview  proves calculator request/response behavior
/api/ai/chat                 proves bottom-right role-aware assistant communication
```

What not to over-explain:

- Do not spend too long inside technical headers.
- Do not call the mock API a weakness.
- Do not promise the database is already live.
- Focus on the business value: the frontend is already prepared for real backend integration.

## API Call Examples You Can Explain Out Loud

Login request:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "superadmin@mipro.local",
  "password": "password123"
}
```

What it means:

> The frontend sends the user's login details. The API returns a session with name, role and permission context. After that, the navbar and pages are based on that role.

Dashboard request:

```http
GET /api/dashboard
x-role: Managing Director
x-user-id: user-md
```

What it means:

> The dashboard asks for management numbers. The API returns only what this role should see, such as sales, bank, stock, import status, receivable and payable.

Sales Executive invoice request:

```http
GET /api/sales/invoices
x-role: Sales Executive
x-user-id: user-sales-1
```

What it means:

> The API receives the user's role and id, so it returns only that person's own invoices. Cost, landed cost and profit fields are removed before the data reaches the screen.

Create record request:

```http
POST /api/sales/quotations
Content-Type: application/json

{
  "quotationNo": "QT-DEMO-001",
  "customer": "Demo Hospital",
  "product": "Dialyzer",
  "quantity": 100,
  "unitPrice": 850,
  "status": "Draft"
}
```

What it means:

> The form is not decorative. It sends a new quotation record. In the prototype it stays temporarily in mock memory. In production it will be inserted into the database.

Approve request:

```http
POST /api/purchase-orders/po-001/approve
x-role: Managing Director
```

What it means:

> The same record moves from pending to approved. This is how management control is represented in the workflow.

Landed cost preview:

```http
POST /api/v1/customs/landed-cost-preview
Content-Type: application/json

{
  "purchaseUnitFob": 50,
  "seaFreightUnit": 4,
  "customsDutyUnit": 8,
  "cfCostUnit": 2,
  "localTransportUnit": 1,
  "bankLcInsuranceUnit": 1.5
}
```

What it means:

> The frontend sends the cost components. The API calculates the landed cost preview and returns the per-unit cost used for inventory valuation and margin analysis.

On Vercel, `/api/:path*` is routed through the single mock API function at `api/index.ts`.

Do not set `VITE_API_BASE_URL` for same-project Vercel deployment unless there is a separate backend domain. If it is set, it must be only the origin, not `/api`.

Correct:

```text
VITE_API_BASE_URL=
```

Also acceptable:

```text
VITE_API_BASE_URL=https://medical-supplier-erp.vercel.app
```

Wrong:

```text
VITE_API_BASE_URL=http://localhost:4174
VITE_API_BASE_URL=https://medical-supplier-erp.vercel.app/api
```

## Requirement Coverage

| Requirement | Prototype Status |
|---|---|
| Web ERP frontend | Complete functional prototype |
| Role-based login/logout | Complete |
| Role-specific navbar and route guards | Complete |
| Super Admin, MD, Accounts, Import, Warehouse, Sales Manager, Sales Executive roles | Complete |
| Sales Executive own-data restriction | Complete |
| Hide purchase cost, landed cost and profit from sales roles | Complete |
| User-level permission toggles | Complete frontend mock |
| Company/branch/warehouse setup | Complete frontend/API mock |
| Product/SKU master with demo images | Complete |
| Supplier database | Complete |
| Customer CRM | Complete |
| Supplier inquiry, PI, PO | Complete |
| LC and TT tracking | Complete |
| Shipment BL/container/vessel/ETA tracking | Complete |
| Customs landed cost calculator | Complete |
| Document archive mock | Complete |
| GRN with rejected qty | Complete |
| BIN, batch, LOT, expiry | Complete |
| FEFO and expiry alerts | Complete |
| Stock movement ledger | Complete |
| Physical count and variance | Complete |
| Quotation/order/challan/invoice/collection | Complete |
| Sales return | Complete |
| Visits and GPS tracking | Complete frontend with map route view |
| Sales targets and commission | Complete |
| Cash book, bank book, GL, vouchers | Complete |
| Receivables and payables | Complete |
| P&L, balance sheet, cash flow previews | Complete |
| Expense management | Complete |
| HR, attendance, leave, advance, payroll | Complete |
| Transport trip/fuel/delivery cost | Complete |
| Reports center | Complete |
| AI agents and floating role-aware AI chat | Complete frontend/mock API |
| Audit, security, settings and profile | Complete |
| Vercel deployment | Complete |

## What Is Demo vs Production

Already demonstrated:

- Functional UI flows
- API-loaded data
- Role-based route/action protection
- Role-based data scoping
- Cost/profit field hiding
- Workflow actions
- Search/filter/export/print
- Mock AI and document archive
- Deployed Vercel prototype

Production phase still needs:

- Real database
- Real authentication and password reset
- Real file upload/storage for documents
- Real GPS capture from mobile device
- Real AI/OCR integration
- Real PDF generation
- Native or PWA mobile app packaging
- Production audit immutability
- Backup, encryption and infrastructure hardening

## Presentation Wording

Use:

> This prototype models your real import-to-accounts workflow. It shows where each department enters data, who approves, how landed cost becomes inventory valuation, how stock flows into sales, how collections flow into accounts, and how management gets live reports.

Use:

> The backend is mocked for the presentation, but the frontend is already built around API contracts so the production backend can replace the mock without redesigning the screens.

Avoid:

```text
This is only a demo UI.
```

Avoid:

```text
Production database, real GPS, real file storage and real AI are already live.
```

## Client Questions and Answers

Q: Can sales executives see company profit?

A: No. Sales Executive and Sales Manager views hide purchase cost, landed cost, COGS and profit fields. Sales Executive also sees only own customers and documents.

Q: Can users delete finalized data?

A: Normal users cannot edit/delete finalized records. Super Admin has override in the prototype; production should audit overrides strictly.

Q: Can import cost automatically affect stock valuation?

A: Yes. Landed cost is calculated before GRN/stock valuation. In production, approved landed cost would become the unit cost used in inventory and profit reports.

Q: Can management see field team location?

A: The prototype shows mobile sales control with GPS check-in and route review. Production mobile app can capture real device GPS and sync it to the ERP.

Q: Does AI make final decisions?

A: No. AI recommends, extracts, warns and summarizes. Human approval remains required.

Q: Is the deployed prototype connected to a real database?

A: No. It uses a mock API for presentation. The production phase replaces mock storage with a real database, authentication and file storage.

## Verification

Run before presenting locally:

```bash
npm run lint
npm run build
npm run smoke
```

Live API checks:

```text
https://medical-supplier-erp.vercel.app/api/health
https://medical-supplier-erp.vercel.app/api/auth/demo-users
https://medical-supplier-erp.vercel.app/api/v1/dashboard/summary
```

Expected:

- Each returns JSON with `"success": true`.
- Login works with demo accounts.
- Dashboard opens after login.

## Best Closing Line

> We have already mapped the client business from overseas supplier inquiry to landed cost, warehouse batch traceability, hospital sales, collection, accounts and executive reporting. The next step is final SRS confirmation and replacing the mock API with the production backend.
