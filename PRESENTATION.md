# MIPRO Digital Platform

## Client Presentation Guide

**Build:** Corporate MiproBD website plus protected workflow-driven ERP, updated through the 25 August 2026 update4 platform separation

**Primary requirements:** `files/MIPRO_ERP_Simplified_Plan_update4.md` and `files/MIPRO_ERP_Landingpage_Analysis.md`, with update3 retained as the validated internal ERP foundation
**Purpose:** Explain what the system does, how information moves, who performs each action, and what the prototype proves.

---

## 1. The One-Minute Explanation

The product is now one digital platform with a deliberate public/private boundary:

```text
PUBLIC WEBSITE
MIPRO Healthcare Corporation / MiproBD
Home -> About -> Products -> Certificates -> News -> Contact
                              |
                              v
                       Employee Portal
                              |
                              v
PROTECTED MIPRO ERP
Imports -> Inventory -> Sales -> Collections -> Accounts -> Reports
```

The public website explains MIPRO's healthcare supply business and provides a B2B product catalogue and business inquiry. It never exposes ERP stock, costs, supplier terms, internal sales or mock management figures. Employee accounts are created internally by Super Admin; the public Request Access flow has been removed.

Inside the protected boundary, MIPRO ERP connects two real business flows through warehouse stock:


```text
IMPORT AND LANDED COST
PO -> Supplier -> PI -> LC or TT -> Shipment -> Costs -> Finalized landed cost
                                                             |
                                                             v
                                                    WAREHOUSE STOCK
                                                             |
                                                             v
SALES AND COLLECTION
Customer -> Quotation -> Order -> Delivery Challan -> Collection -> Customer due
```

One import record represents one shipment or consignment and may contain many products. The record begins with an internal reference such as `IMP-2026-001`. When an LC is opened, its LC number becomes the main visible reference without recreating the record.

Each shipment cost has its own allocation rule. Finalized landed cost flows into warehouse batches. A delivery consumes an actual batch, and a collection updates both the customer due and the chosen cash or bank account. Daily operating expenses remain separate from product landed cost.

---

## 2. Why This Version Is Different

The latest client meetings and actual spreadsheets showed that the earlier prototype was too broad. This replacement is organized around connected work instead of dozens of generic modules.

### Current application

- Corporate public website with separate typed product projections and no e-commerce cart.
- Registered MIPRO identity, product imagery, corporate About, curated resources, contact map and inquiry flow.
- Authorized manufacturer certificate scans migrated from the previous MiproBD site, with holder, product scope, visible dates, current/historical status, preview and download; none are presented as MIPRO corporate certificates.
- Employee Portal login that is production-safe by default; demo users require `VITE_DEMO_MODE=true`.
- Public signup removed; employee provisioning remains in Settings -> Users & Capabilities.
- SEO metadata, sitemap, robots rules and old MiproBD product redirects.
- Exactly seven possible main destinations.
- Draft imports begin with supplier, PO and product lines; PI and LC/TT are added later to the same case.
- One import workspace instead of separate PI, PO, LC, shipment, customs, costing, and GRN pages.
- One sales workspace instead of disconnected quotation, order, challan, and collection pages.
- Server-derived milestones instead of manually selectable financial/warehouse statuses.
- FIFO issue allocation can split one requested quantity across several oldest eligible batches, with expired stock excluded.
- Sensitive product cost and profit protected by explicit capability.
- Narrow operational accounts, not a premature full accounting package.
- Realistic local medical product images and client-like sample records.
- Actual MIPRO and LED TRACKERS stationery backgrounds plus calibrated digital/preprinted A4 modes.
- Employee/date-filtered salesperson performance with all-person comparison and individual print.
- Protected PDF/image viewing for import, cost, and expense evidence.
- Floating contextual MIPRO AI, reviewed document extraction, and smart operational recommendations.
- A real coordinate-based Field Team map inside Sales with clustering, timestamps, status rules, customer visits, and route history.
- Searchable EmployeePicker, territory filtering, sortable/paginated team performance, and report-to-field-activity links.
- A role-safe Smart Insights review queue linked from Dashboard, without adding an eighth main destination.

### Intentionally deferred

- Native mobile application and reliable background tracking after browser closure
- Production Supabase realtime location feed and durable location history
- HR and payroll
- Fleet management
- Full general ledger, trial balance, and balance sheet
- Automatic customs, VAT, AIT, or HS-code duty formulas

There is no GPS sidebar module or AI Command Center. Field Team stays inside Sales, Smart Insights is a secondary Dashboard route, and the floating assistant remains contextual. The web currently consumes a clearly labelled demo location feed through the same typed contracts intended for the future mobile client.

---

## 3. Main Navigation

| Area | Business purpose |
|---|---|
| Dashboard | Role-safe KPIs and items requiring action |
| Imports | One case from commercial setup through cost and receiving |
| Inventory | Stock, batches, expiry awareness, and movement history |
| Sales | Customers, quotations/orders, deliveries, collections, and role-scoped Field Team |
| Expenses & Accounts | Operating expenses, cash/bank, dues, and transaction ledger |
| Reports | Grouped operational reports and narrow audit history |
| Settings | Users, capabilities, master data, setup, print identity, and open client decisions |

Workflow stages appear inside these areas as sections or segmented views. They are not extra navigation modules.

---

## 4. Role Access

A user chooses the appropriate demo identity only while signing in. The role cannot be changed inside the application. In production, the Super Admin creates users and assigns roles/capabilities in Settings.

| Role | Main navigation visible | Contextual access |
|---|---|---|
| Super Admin / Owner | All seven areas | All owner-authorized actions |
| Managing Director | Dashboard, Imports, Inventory, Sales, Expenses & Accounts, Reports | Review and operational visibility |
| Import Officer | Dashboard, Imports | Commercial/import maintenance; sensitive costing only if explicitly granted |
| Warehouse Manager | Dashboard, Inventory | Finalized import receiving reference and delivery work |
| Accounts | Dashboard, Sales, Expenses & Accounts, Reports | Customer dues, collections, expenses, cash/bank |
| Sales Manager | Dashboard, Inventory, Sales, Reports | Available stock and commercial records |
| Sales Executive | Dashboard, Sales, Reports | Own customers, quotations/orders, collections, and own performance report only |

Directly typing an unauthorized URL still shows **Access denied**. The server also checks the role and capability; hiding a menu item is not the only control.

### Sensitive capabilities

- `view_sensitive_cost`
- `edit_sensitive_cost`
- `finalize_landed_cost`
- `reopen_landed_cost`
- `view_profit`
- `approve_stock_override`
- `approve_special_price`

The Super Admin is the temporary sole landed-cost finalizer/reopener until the client confirms another authority.

---

## 5. Demo Login

Demo identities are intentionally hidden in production mode. For the presentation deployment, set `VITE_DEMO_MODE=true`. All active demo users then use:

```text
Password: password123
```

| Role | Email |
|---|---|
| Super Admin | `superadmin@mipro.local` |
| Managing Director | `md@mipro.local` |
| Accounts | `accounts@mipro.local` |
| Import Officer | `import@mipro.local` |
| Warehouse Manager | `warehouse@mipro.local` |
| Sales Manager | `salesmanager@mipro.local` |
| Sales Executive | `sales1@mipro.local` |

Use Super Admin for the complete presentation. Sign out and use one other role near the end to prove access control.

---

## 6. Responsibility And Approval Matrix

| Record or action | Who enters it | Who may edit it | Delete/cancel rule | Who approves/posts | Result |
|---|---|---|---|---|---|
| Product | Super Admin or Import Officer | Same permitted roles | Super Admin deletes only when unreferenced; otherwise deactivate | No separate approval | Canonical item used by import, stock, and sales |
| Product alias | Super Admin | Super Admin | Remove mapping without deleting the canonical product | Super Admin | Legacy spreadsheet spelling maps to one product |
| Supplier | Super Admin or Import Officer | Same permitted roles | Super Admin deletes only when unreferenced | No separate approval | Reused by import cases |
| Import commercial data | Import Officer or Super Admin | Same roles before finalization | Draft/unposted case only | No separate approval | One connected import case |
| Import product line | Import Officer or Super Admin | Same roles before finalization | Before cost finalization | No separate approval | Quantity, FOB, CBM, and HS reference |
| Import document/file | Import users | Import users | Protected after transaction use | Human reviews any extracted fields | PI, LC, BL, customs, and other evidence opens through an authorized viewer |
| Import cost line/file | User with `edit_sensitive_cost` | Same capability before finalization | Before finalization | Owner reviews through preview | Named cost, allocation rule, and protected supporting evidence |
| Landed-cost snapshot | System calculates | Immutable after finalization | Never physically deleted | `finalize_landed_cost` | Historical per-product/per-unit cost |
| Reopen landed cost | Not applicable | Authorized owner with reason, before first receipt only | Old snapshot remains in history | `reopen_landed_cost` | Audited correction cycle; post-receipt reopen is blocked |
| Warehouse receipt | Warehouse Manager or Super Admin | Posted as a receipt transaction | No silent delete | Receiving user posts | Batch/lot stock and stock-in movement |
| Customer | Sales Manager, Sales Executive, Super Admin | Owner-scoped for Sales Executive | Only when no protected transactions | No approval in current scope | One normalized customer ledger |
| Quotation | Sales Manager, Sales Executive, Super Admin | Draft/active quote owner | Draft/rejected only | Accepted quote converts to order | Carries lines forward |
| Sales order | Created from accepted quotation | No duplicate line entry | Cancel rules belong to production backend | Conversion action | Delivery-ready commercial commitment |
| Delivery challan | Warehouse Manager, Sales Manager, Super Admin | Posted transaction | No silent delete | Dispatch user posts | FIFO may create several batch lines; stock-out and customer due post together |
| FIFO override | Authorized dispatch user | Reason is required | Audit event is permanent | `approve_stock_override` | Newer lot may be used exceptionally |
| Collection | Accounts, Sales Manager, Sales Executive, Super Admin | Production will use reversal/correction | No silent delete | Posting user | Reduces due and increases chosen account |
| Expense | Accounts or Super Admin | Correct through reversal | Reverse with reason | Accounts/Super Admin posts | Reduces selected cash/bank account |
| Expense category | Super Admin | Super Admin | Protect referenced categories | Super Admin | Dynamic daily expense classification |
| Opening stock batch | Super Admin | Posted migration transaction | No silent delete | Super Admin posts | Legacy lot joins FIFO/expiry stock |
| Customer opening balance | Super Admin | Posted migration transaction | One opening per customer | Super Admin posts | First running-ledger due at cutover |
| User/capabilities | Super Admin | Super Admin | Deactivate rather than erase history | Super Admin | Route, action, and sensitive-field access |
| AI extraction | Import user requests it | User selects fields to apply through normal forms | Extraction itself changes nothing | Human review is mandatory | Suggested values pass through existing validation and audit |
| AI recommendation/chat | System reads role-scoped records | User may dismiss locally or open its source | No operational record is deleted | AI cannot approve/post/finalize | Explanation and next-step guidance only |
| Current field location | Future salesperson web/mobile client | The same salesperson supplies newer points | Coordinates stay as history; no ordinary delete | Tracking session and API scope validate the write | Role-scoped live/last marker with timestamp and accuracy |
| Customer visit verification | Assigned Sales Executive | Check-out adds outcome | Historical visit event remains | Assigned employee checks in/out | Separate visit evidence linked to customer and route |
| Smart Insight | Rule-backed API creates it | User can filter or dismiss locally | Dismissal posts no transaction | Normal source workflow remains authoritative | One role-safe review queue across permitted areas |
| Client decision | Super Admin records confirmation | Super Admin | Audit-worthy status change | Client confirms externally | Prevents assumptions being hard-coded |

---

## 7. How Data Connects

### 7.1 Master data starts the chain

```text
Settings
  Products -----------+
  Suppliers ----------+--> Import Case
  Cost Presets -------+
  Warehouse ----------+--> Warehouse Receipt
  Customers ----------+--> Quotation
  Cash/Bank Accounts -+--> Collection and Expense
  Print Configuration +--> Printed documents
```

Users select existing records instead of repeatedly typing names. Product variants such as Dialyzer 1.7H and 1.7L remain distinct canonical products.

### 7.2 Import creates stock

```text
ImportCase
  + ImportItems
  + Documents
  + ImportCostLines
       |
       v
Cost Preview -> Exact allocations -> Finalized LandedCostSnapshot
                                             |
                                             v
                                   WarehouseReceipt
                                             |
                                             v
                                  StockBatch + StockIn Movement
```

The receiving user enters received/rejected quantity, lot, batch, manufacturing date, expiry, warehouse, and location. Product identity, import reference, and landed cost are inherited from the finalized snapshot.

The browser may show calculated FOB/CBM immediately, but the API recomputes quantity x FOB/unit x captured exchange rate and cartons x CBM/carton with Decimal arithmetic. Totals sent by the browser are never treated as authoritative.

### 7.3 Sales consumes stock

```text
Customer -> Quotation -> Accepted -> SalesOrder
                                      |
                                      v
                            Delivery + FIFO batch plan
                                      |
                         +------------+-------------+
                         v                          v
                StockOut Movement             Customer Due
                                                    |
                                                    v
                                               Collection
                                             /      |       \
                                          Cash    bKash    Bank/Cheque
                                                    |
                                                    v
                                           Account Transaction
```

Line items carry forward from quotation to order. The API builds the actual FIFO batch plan and can split one product line across several batches. An authorized user can deliberately prefer a newer lot only with an override reason.

### 7.4 Expenses stay isolated

```text
Daily Expense or TA/DA -> Selected Cash/Bank Account -> Account Transaction

No connection to ImportCostLine or LandedCostSnapshot
```

Rent, salaries, utilities, office transport, entertainment, and TA/DA never change product landed cost.

---

## 8. Import Workspace Walkthrough

### Start before PI or LC

Click **New Import** to create the case with supplier, PO number/date, at least one canonical product line, optional target shipment date, and notes. The system generates `IMP-YYYY-NNN`. PI and payment mode are intentionally optional at this point.

When the supplier PI is added, the API derives **PI Received**. When an LC number or TT reference is recorded, that value becomes the main visible reference for the same record. No record is copied or recreated.

Open **Imports**, then select **LC-77612**. The page represents one multi-product consignment.

### Milestone header

The status path includes:

```text
Draft -> PI Received -> LC/TT Opened -> In Production -> Shipped
-> At Port -> Costing -> Cost Finalized -> Partially Received
-> Received -> Closed
```

Cancelled is also supported.

Users do not choose final states from a generic status field. **Mark In Production**, **Mark Shipped**, **Mark At Port**, **Cancel Case**, and **Close Case** are controlled actions. Cost finalization and warehouse receipt set their own statuses. Closed/cancelled cases are read-only; only an unposted cancelled/draft case may be deleted.

### Six sections

1. **Commercial & Products**
   Supplier, PO, optional PI, products, quantities, FOB, cartons, and CBM. Authoritative FOB/CBM totals are recomputed by the API.

2. **LC / TT & Shipment**
   Payment mode, LC/TT reference and amount/date, bank, rate snapshot, commercial invoice, production follow-up, BL, container, vessel, ETD, and ETA.

3. **Documents**
   Actual PDF/image content plus metadata for PI, LC/Swift, commercial invoice, packing list, COA, CE, ISO, BL, customs assessment, duty proof, freight, insurance, bank advice, and C&F evidence. View opens the shared protected viewer; Extract Fields opens a review panel and never overwrites data automatically.

4. **Costs & Allocation**
   Any number of named costs with currency, historical exchange rate, vendor/payment metadata, attachment, product scope, and an explicit allocation method.

5. **Landed-Cost Result**
   Exact shipment reconciliation, final product total, landed cost per unit, and expandable explanations.

6. **Warehouse Receipt & Activity**
   Receiving unlocks only after cost finalization. Partial and final receipts remain connected to the same import case.

### Five allocation methods

| Method | Typical use | Formula basis |
|---|---|---|
| CBM | Sea freight, volume-related local transport | Product CBM / eligible total CBM |
| FOB value | Shared bank or institutional costs | Product FOB value / eligible FOB total |
| Quantity | Shared handling/labour where chosen | Product quantity / eligible total quantity |
| Product-specific | Final customs duty assessed for one or selected products | Only selected products receive the cost |
| Manual split | Exceptional documented business split | User-entered BDT amounts must exactly equal the cost |

Foreign currency is converted using the stored exchange-rate snapshot. Final allocations round to two decimal places. Any residual poisha is assigned by the largest fractional remainder, with stable item-ID tie-breaking. The sum always reconciles to the original cost row.

### What the system does not calculate

The user enters the final assessed customs duty per product from official customs evidence. The ERP does not guess HS-code duty, VAT, AIT, or customs formulas.

Local covered-van transport defaults to CBM because the latest meeting confirmed it behaves like sea freight by volume. Common bank/C&F/insurance defaults remain pending; their allocation method stays explicit on each row.

---

## 9. Inventory Walkthrough

Inventory has only three internal views:

- **Stock:** available quantity by canonical product, with image, sale price, FIFO lot, and nearest expiry.
- **Batches:** lot, batch, import reference, receipt date, manufacturing/expiry, warehouse location, and available quantity.
- **Movements:** stock-in and stock-out transaction history.

Legacy stock is entered once through **Settings -> Data Migration -> Opening Batch** with product, quantity, lot/batch, MFG/expiry, historical receipt date, old LC/source, warehouse/location, and optional landed cost. It then participates in the same FIFO sequence as newly received imports.

### FIFO with expiry awareness

FIFO means the oldest eligible matching receipt is recommended first. Expiry is always shown. Selecting a newer batch while an older eligible batch still has stock produces a warning.

The allocator can fulfill one requested quantity from several batches. For example, a 60-piece delivery can post 30 from the oldest lot and 30 from the next lot. Expired batches are never included, even if their receipt date is older.

An authorized override requires:

1. `approve_stock_override` capability.
2. A written reason.
3. A permanent audit event.

The server prevents negative stock, receipt quantities beyond the import quantity, and an expiry date earlier than manufacturing date.

Expiry categories (`Expired`, `1 Month Alert`, `3 Month Alert`, `6 Month Alert`, `Normal`) are calculated from the current Bangladesh business date by the API.

---

## 10. Sales Walkthrough

Sales has four internal views:

1. **Customers**
2. **Quotations & Orders**
3. **Deliveries**
4. **Collections**

### Customer ledger

The customer's historical spreadsheet tab becomes one customer row plus connected transactions. Opening legacy balances can be posted at a cutover date. The detail ledger shows delivered sales, collections, current due, credit terms, transaction references, discounts/remarks, and a running balance.

Product aliases from the legacy `Item Mapping` sheet map spelling variants to a canonical product, preventing duplicate inventory identities.

### Owner-only price check

In the quotation editor, an authorized owner can preview expected FIFO COGS, effective sale price, gross profit per unit, total gross profit, and margin. A below-cost proposal is visibly marked as a loss. Sales Executives never receive the cost/profit fields.

### Quotation to collection

```text
Create quotation
-> Accept and convert
-> Order created with the same line items
-> Select actual batch for delivery
-> Delivery challan posts stock-out
-> Order value becomes customer due
-> Post cash/bKash/bank/cheque collection
-> Customer and order due decrease
-> Cash/bank transaction is created
```

Outstanding credit is supported by leaving part of the order due unpaid. Invoice generation is intentionally shown as pending client confirmation and is not inserted as a mandatory stage.

`Credit` is not a collection method. A posted collection must use Cash, bKash/mobile banking, Bank Transfer, or Cheque, must reference an active destination account, and must include a payment reference for non-cash modes. Customer due, order due, account balance, receipt, and account transaction update together.

### Print outputs

One record can produce:

- Quotation on the supplied MIPRO or LED TRACKERS digital letterhead
- Quotation calibrated for the same physical preprinted paper
- Order Receiving Sheet matching the supplied office-use structure
- Delivery challan
- Money receipt
- Import cost statement

All print sheets use A4 millimetre dimensions and per-identity safe-area settings. Digital mode prints the supplied background image; preprinted mode omits artwork while retaining identical content coordinates.

---

## 11. Expenses And Accounts Walkthrough

This is an operational money view, not a full general ledger.

Internal views include:

- Daily expenses
- Cash and bank accounts
- Account transaction ledger
- Customer dues and collections

Expense entry supports dynamic categories and a TA/DA subtype. Posting creates a debit against the selected cash/bank account. Collections create credits. Posted expenses are reversed with a reason instead of silently deleted.

---

## 12. Reports And Audit

Reports remain one destination grouped into:

- Import and landed cost
- Inventory
- Sales and collection
- Expense and cash/bank
- Narrow audit

The From/To dates are sent to the API and applied before period totals/tables are built. Reports read the same records used by operations; there is no duplicate reporting dataset. CSV export contains the currently filtered table rows, and print uses the current report group.

Detailed tables include import register, cost breakdown, landed cost by product/batch, current batch stock, expiry attention, movements, sales by customer/product/month, collections, receivables, running customer ledger, daily expenditure, category summary, TA/DA sheet data, and cash/bank transactions. Realized delivered profit uses the actual dispatched batch landed cost and is owner/capability-only.

### Salesperson Performance

Under **Reports -> Sales & Collection -> Salesperson Performance**, management uses the existing From/To range and an employee selector. **All Sales Employees** compares quotes, conversions, orders, delivered sales, collections, customers, dues, and conversion rate. Selecting one executive opens quotation, order, delivery/challan, collection, customer, and product details plus an A4 employee report.

Attribution follows business ownership rather than whoever typed the action:

```text
Customer.assignedSalesUserId
  -> Quotation.ownerId
  -> Order.ownerId
  -> Delivery.salesOwnerId
  -> Collection.ownerId
```

`createdByUserId`, `dispatchedByUserId`, and `postedByUserId` retain operator history. Therefore a manager may create an order or Accounts may post a collection without stealing the executive's performance credit. Sales Executives receive only their own report; no FOB, landed cost, COGS, or profit field is returned.

The narrow audit captures high-risk actions such as:

- landed-cost finalization or reopening
- allocation changes
- warehouse receiving
- FIFO override
- stock dispatch
- collection posting
- expense reversal
- capability changes
- document attachment and AI extraction review activity

---

## 13. Documents And Contextual AI

### Protected document flow

```text
User selects PDF/image
  -> typed fileService/importService/accountsService request
  -> API validates role, entity access, MIME type, size, and sensitivity
  -> metadata + temporary content stay linked to that business record
  -> GET /api/documents/:id/content re-checks authorization
  -> shared viewer renders PDF or image and offers open/download
```

Import documents, freight/cost evidence, and expense receipts use this flow. Sensitive customs or import-cost files require `view_sensitive_cost`, even when a user guesses the direct URL. Generated quotation/order/challan/receipt/import-cost documents still use the calibrated `PrintPage` because they come from ERP records rather than uploaded binaries.

### Contextual MIPRO AI

The assistant is fixed at the bottom-right on desktop and becomes a near-full-screen panel on mobile. It receives only route/entity context, optional selected employee, and the selected report period, then the API builds an answer from records already permitted for the signed-in role.

- Imports: stage, missing documents, and authorized allocation explanation.
- Inventory: FIFO lot and expiry attention matching the deterministic engine.
- Sales: own/team-visible dues, open quotations, and follow-up suggestions.
- Reports: current-period sales/collection and employee summaries.
- Dashboard: role-safe management priorities.
- Field Team: current/last status, visit context, stale feeds, and own/team scope.
- Smart Insights: explanation and source navigation for the current review queue.

The assistant cannot call finalization, dispatch, collection, or update endpoints. Document extraction returns proposed fields with confidence and warnings; all checkboxes begin unselected, and the user explicitly applies verified fields through the same validation used by manual editing. In this release answers are deterministic mock intelligence behind replaceable typed endpoints, not a production model claim.

### Field Team management flow

```text
Future Web/Mobile Sales Client
  -> start tracking session
  -> submit timestamped coordinate + accuracy + source
  -> optional customer visit check-in/check-out
  -> shared field-team API
  -> current-location feed + historical points + visits
  -> Sales > Field Team map and employee performance report
```

The current release supplies realistic mock records through that boundary and labels them **Demo location feed**. Leaflet renders actual latitude/longitude markers, clustering, pan/zoom, customer points and stored-coordinate route polylines. It never calls an old coordinate “live” and never estimates distance from the number of stops.

Access is enforced by the API: Super Admin and Managing Director see the full operational feed, Sales Manager sees the sales team, Sales Executive sees only their own activity, and Accounts/Import/Warehouse receive `403`. Visit verification and periodic tracking are distinct records, so customer check-in evidence is not confused with work-session movement.

---

## 14. Settings And Client Confirmation Queue

Settings is for Super Admin only.

It contains:

- Users and capabilities
- Read-only Role Access Summary inside user create/edit
- Products with medical product imagery and legacy aliases
- Suppliers
- Cash and bank accounts
- Main warehouse
- Expense categories
- Import cost presets
- Print identity/configuration
- Data Migration for opening stock batches and customer balances
- Client Confirmation Queue

The queue makes unresolved requirements visible:

- Default allocation for common costs
- Invoice requirement
- Accounting depth
- Number of warehouses
- Selling-price approval
- Sales VAT/tax
- Cost-finalization authority

Each decision stores the question, current behavior, status, actual resolution value/notes, source, confirmer, and confirmation time. Local transport CBM and FIFO-with-expiry-awareness are already marked confirmed. The prototype does not silently convert the remaining questions into permanent business rules.

---

## 15. What An API Call Means

For a non-technical audience, describe the API as the system's controlled messenger.

Example:

```text
User clicks "Preview landed cost"
        |
        v
The page sends the import ID to the API
        |
        v
The API validates permission and calculation inputs
        |
        v
The costing engine allocates every cost
        |
        v
The API returns a structured result
        |
        v
The page displays totals and explanations
```

The frontend never reads a hidden mock spreadsheet directly. Every screen calls a typed domain service. Zod validates the returned structure before a component uses it. A future real database/backend can replace Express without rewriting the pages.

### Why show this to the client

You are not showing code for its own sake. You are proving:

- the screens are connected, not static pictures;
- permission rules are checked at the data boundary;
- one action updates downstream records;
- the frontend is ready for a real backend;
- calculations have one deterministic source of truth.

---

## 16. API Map

### Session and dashboard

| Method and path | Purpose |
|---|---|
| `POST /api/auth/login` | Start a role-based session |
| `GET /api/auth/demo-users` | Populate demo identities |
| `GET /api/me` | Read the current user |
| `GET /api/dashboard` | Return role-safe KPIs and action lists |

### Imports

| Method and path | Purpose |
|---|---|
| `GET/POST /api/imports` | List or create import cases |
| `GET/PATCH/DELETE /api/imports/:id` | Read, edit, or remove an eligible draft |
| `POST /api/imports/:id/transition` | Advance an allowed operational milestone, cancel, or close |
| `POST/PATCH/DELETE /api/imports/:id/items/*` | Maintain products within the same case |
| `POST/PATCH/DELETE /api/imports/:id/costs/*` | Maintain sensitive named cost rows |
| `POST /api/imports/:id/documents` | Validate and attach an actual PDF/image to the import case |
| `GET /api/documents/:id/content` | Re-authorize and stream/redirect protected file content |
| `POST /api/imports/:id/cost-preview` | Calculate and explain allocations |
| `POST /api/imports/:id/finalize` | Create immutable snapshot |
| `POST /api/imports/:id/reopen` | Reopen with capability and reason |
| `POST /api/imports/:id/receive` | Create receipt, batch, and stock-in movement |
| `GET /api/imports/:id/receipts` | Read partial/final receiving history |

### Inventory

| Method and path | Purpose |
|---|---|
| `GET /api/inventory/stock` | Product-level availability |
| `GET /api/inventory/batches` | Lot/batch/expiry stock |
| `GET /api/inventory/movements` | Stock transaction history |
| `POST /api/inventory/dispatch-preview` | Return an oldest-first, multi-batch, non-expired allocation plan |

### Sales

| Method and path | Purpose |
|---|---|
| `GET/POST/PATCH/DELETE /api/customers/*` | Customer master with owner-scoped writes |
| `GET /api/customers/:id/ledger` | Delivered sales, collections and running due |
| `GET/POST/PATCH/DELETE /api/quotations/*` | Quotation workflow |
| `POST /api/sales/profit-preview` | Owner-only expected FIFO COGS and gross profit |
| `POST /api/quotations/:id/convert` | Carry quote lines into an order |
| `GET/PATCH /api/orders/*` | List orders and maintain supplied receiving-sheet fields |
| `GET/POST /api/deliveries` | Post actual batch delivery and stock-out |
| `GET/POST /api/collections` | Validate real payment account, post receipt, and reduce due |

### Field Team

| Method and path | Purpose |
|---|---|
| `GET /api/field-team/current` | Return role-scoped current/last locations, derived statuses, visits, and feed summary |
| `GET /api/field-team/employees?search=&territory=&status=` | Search the permitted field team without one huge native selector |
| `GET /api/field-team/:userId/history?date=` | Return stored coordinate sequence, session, and visit timeline with own/team enforcement |
| `GET /api/field-team/:userId/visits?from=&to=` | Return authorized customer visit records |
| `POST /api/field-team/tracking/start` | Start the signed-in salesperson's foreground tracking session |
| `POST /api/field-team/tracking/location` | Accept validated coordinate, accuracy, timestamp, and web/mobile source |
| `POST /api/field-team/tracking/stop` | End the signed-in salesperson's session |
| `POST /api/field-team/visits/:id/check-in` | Verify the assigned salesperson's visit location |
| `POST /api/field-team/visits/:id/check-out` | Complete the assigned visit with outcome |

### Accounts, reports, and settings

| Method and path | Purpose |
|---|---|
| `GET/POST /api/expenses` | Read/post operating expense |
| `POST /api/expenses/:id/reverse` | Reverse with reason |
| `GET /api/accounts` | Cash/bank positions |
| `GET /api/account-transactions` | Simple transaction ledger |
| `GET /api/reports?from=...&to=...` | Date-filtered role-safe totals and detailed report tables |
| `GET /api/reports/salespeople?from=...&to=...&employeeId=...` | All-person comparison or one authorized employee report |
| `POST /api/ai/chat` | Return a current-context, role-safe answer and source links |
| `GET /api/ai/insights` | Return compact page/report summaries |
| `GET /api/ai/recommendations` | Return role-safe import, inventory, sales, collection, finance, or field-team actions; powers Smart Insights |
| `POST /api/ai/document-extract` | Propose import fields for explicit human review |
| `GET/POST/PATCH/DELETE /api/products/*` | Product master |
| `GET/POST/PATCH/DELETE /api/suppliers/*` | Supplier master |
| `/api/settings/opening-stock` | Post a historical stock batch and receive movement |
| `/api/settings/customer-opening-balances` | Post a reconciled legacy customer due |
| `/api/settings/product-aliases` | Map legacy names to canonical products |
| `/api/settings/*` | Users, decisions, accounts, warehouse, presets, and print calibration |
| `GET /api/audit` | Narrow high-risk audit trail |

---

## 17. Temporary Data Behavior

This release is a complete functional frontend backed by an in-memory Express API.

During a running demo, create/edit/delete/finalize/receive/deliver/collect/reverse actions work and connected screens update. The data is temporary:

- a local API restart resets the seed;
- a Vercel function cold start or redeployment may reset it;
- different serverless instances may not share the same memory;
- uploaded file content and metadata live only in that API process;
- seeded PDFs/images are presentation assets but still open through authorization.

This is correct for frontend workflow approval. Production requires persistent authentication, database, storage, authorization, audit retention, backups, and transactions, with Supabase/Postgres being the planned replacement.

---

## 18. Seven Acceptance Scenarios

### A. Multi-product import costing

- Create a draft from PO before PI/LC, then add PI and LC to the same case.
- One LC contains Dialyzer, Blood Line Sets, and AV Fistula.
- Products have different quantities, FOB values, CBM, and assessed duty.
- Costs use all five allocation methods.
- Every cost and final shipment total reconcile exactly.
- Finalization creates an immutable snapshot.
- Reopen works before receipt but is blocked after the first receipt.
- Partial and final receipt create stock at inherited cost.

### B. FIFO stock selection

- Opening/legacy stock and newer import stock share one sequence.
- A 60-piece dispatch is automatically split 30 + 30 across two oldest eligible batches.
- An older expired batch remains visible but is excluded.
- Selecting the newer lot shows a warning.
- Authorized override requires a reason and audit entry.

### C. Quotation to collection

- Owner can preview expected FIFO landed cost and profit/loss before quoting.
- Create a quotation.
- Convert it without re-entering lines.
- Post delivery from an actual batch.
- Stock decreases.
- Customer due increases.
- Collection reduces due and updates the chosen account.
- Customer running ledger and actual filtered reports show the connected result.

### D. Expense isolation

- Post general office expense and TA/DA.
- Daily expenditure, category summary and TA/DA Approved Sheet update.
- Finalized import and product landed costs do not change.

### E. Employee performance

- Sales Manager compares all executives for a selected From/To period.
- One employee report shows owned quotes, inherited deliveries, collections, customers, and products.
- Individual A4 print uses the same report data.
- Sales Executive cannot request another employee or receive cost/profit fields.

### F. Protected documents

- PI and freight PDFs open in the shared viewer; the expense receipt opens as an image.
- Missing content produces a clear error instead of a blank screen.
- Import Officer cannot open sensitive customs/freight content by direct URL.
- Extract Fields changes nothing until the user reviews and selects fields.

### G. Contextual AI

- Import questions use the current `LC-77612` context and link back to the record.
- FIFO/expiry recommendation agrees with deterministic inventory data.
- Sales follow-up is scoped to the signed-in role.
- Sales Executive landed-cost/profit question returns a restriction without a secret value.

### H. Field Team and scalable employee reporting

- Sales Manager sees the permitted team on real latitude/longitude markers and can filter by employee, territory, and derived status.
- Marker detail always shows last-updated time and GPS accuracy; stale data is never labelled live.
- Route History draws the stored coordinate sequence and lists visit check-in/out events without inventing route distance.
- Sales Executive current/history endpoints contain only self; Accounts/Import/Warehouse receive `403`.
- EmployeePicker searches name, employee ID, and territory; team comparison supports territory, search, sorting, and pagination.
- Employee performance links to Field Activity and the field card links back to the same employee report.

### I. Smart Insights

- Dashboard links to the secondary `/app/insights` review queue without changing the seven-item sidebar.
- Category/severity filters use the same role-safe recommendation API as the floating assistant.
- Dismiss removes only the local alert card and never posts or mutates an operational transaction.
- Field Team AI cannot reveal another salesperson to a Sales Executive.

These scenarios are covered by automated unit, API-flow, role, and browser smoke tests.

---

## 19. Recommended Live Presentation Order

1. Landing page: explain the two flows and shared warehouse bridge.
2. Login: choose Super Admin and explain fixed role identity.
3. Dashboard: show no more than six KPIs and action lists.
4. Imports: briefly open New Import to prove PO-first draft creation, then open LC-77612.
5. Import sections: show progressive PI/LC entry, then open the PI PDF and Extract Fields review.
6. Cost preview: open the freight evidence, expand an allocation explanation, and explain exact reconciliation.
7. Inventory: show product images, smart FIFO/expiry alert, opening/import batches, and multi-batch FIFO.
8. Sales: show customer running ledger, follow-up recommendations, owner profit preview, and quotation-to-order connection.
9. Field Team: show the demo-feed label, clustered coordinate map, status/territory filters, marker detail, and Route History.
10. Reports: search `SE-001`, filter territory, sort the team, open Rafiq, and move between performance and field activity.
11. Smart Insights: open from Dashboard, filter Inventory/Field Team, open a source, and dismiss one card.
12. Deliveries: explain the automatic batch split and stock-out.
13. Collections: explain due and account update.
14. Expenses & Accounts: prove operating costs stay separate and open the utility receipt image.
15. MIPRO AI: ask about the current import and Field Team, then show role-safe source links.
16. Settings: show users/capabilities, Role Access Summary, aliases, opening data, print identities, and decisions.
17. Sign in as Sales Executive: prove own Sales/Reports/My Activity, direct employee denial, and AI cost/location refusal.

---

## 20. Honest Production Position

### Complete in this release

- Simplified route and navigation architecture
- Role and capability-aware frontend/server behavior
- Connected import, costing, receipt, stock, sales, collection, expense, report, and settings flows
- PO-first drafts, server-derived milestones, terminal case controls, and authoritative Decimal item bases
- Deterministic Decimal.js allocation engine
- Multi-batch non-expired FIFO, opening stock, customer opening balances, aliases, and running ledger
- Owner-only expected/realized profit views
- Typed DTO/domain services and Zod response validation
- Supplied MIPRO/LED letterhead assets, Order Receiving Sheet, and calibrated A4 print previews
- Responsive desktop/mobile frontend
- Protected PDF/image viewer, temporary upload content, and seeded document evidence
- Salesperson comparison/detail/print with owner-correct attribution
- Contextual role-safe MIPRO AI, smart alerts, source links, and reviewed extraction
- Leaflet/OSM field-team map with marker clustering, derived status, role-scoped history, visits, and typed future write contracts
- Searchable EmployeePicker, territory/search/sort/pagination, and performance-to-field navigation
- Dashboard-linked Smart Insights review queue with category/severity filters and non-transactional dismissal
- Vercel-compatible same-origin mock API
- Automated acceptance coverage

### Required for production backend phase

- Persistent database and file storage
- Real authentication and password/email delivery
- Server/database transactions and row-level security
- Durable audit history
- Durable private file storage, signed URLs, and server-generated PDF snapshots
- Production AI model/orchestration, retrieval, monitoring, and evaluation
- Excel migration/import tooling
- Backups, monitoring, and operational deployment controls

The frontend is ready for client workflow approval and backend integration. It must not be represented as a live production database.

---

## 21. Likely Client Questions

**Why are there fewer tabs now?**

Because PO, PI, LC, shipment, costs, and receiving are stages of one import job. Fewer destinations reduce duplicate entry and training effort.

**Can one LC contain multiple products?**

Yes. LC-77612 demonstrates different products, quantities, FOB values, CBM, and duty under one import case.

**Can work begin before the supplier sends PI or the bank opens LC?**

Yes. Create one PO-first draft under an internal IMP reference, then add PI and LC/TT later. The same case continues throughout.

**Can we add a new type of import cost?**

Yes. Use `+ Add Cost`, name it, enter currency/rate/payment details, and explicitly choose its allocation rule.

**Does the system calculate customs duty?**

No. It stores the final officially assessed amount per product and allocates it per unit. It does not invent customs formulas.

**Can sales staff see landed cost?**

Not by default. Sensitive values require explicit capabilities.

**Does FIFO ignore expiry?**

No. FIFO controls recommendation order; expiry remains visible and alertable at every batch decision.

**Can a newer batch be used?**

Yes, only for a capable user with a written reason. The override is audited.

**What happens when one batch cannot fulfill the quantity?**

The server automatically consumes the oldest eligible batch and continues into the next. Expired stock is excluded from the plan.

**Can finalized cost be changed after warehouse receipt?**

No ordinary reopen is allowed after the first receipt because stock already inherited that valuation. A future formal valuation-adjustment workflow would be required.

**Are the quotation and order forms based on the supplied stationery?**

Yes. Digital mode uses the supplied MIPRO or LED TRACKERS background; preprinted mode keeps the same millimetre content coordinates without printing the artwork. The Order Receiving Sheet includes the supplied customer, payment, responsibility, and office-use structure.

**Where is invoice generation?**

The latest client flow is quotation -> order -> challan -> collection. Invoice is shown in the confirmation queue until the client defines whether it is mandatory or optional.

**Where are AI, GPS, HR, and fleet?**

Contextual MIPRO AI and the web management side of field tracking are active. Sales > Field Team displays a clearly labelled demo location feed with real coordinates, clustering, current/stale/offline rules, visit history, and strict own/team access. The future native mobile app, reliable tracking after browser closure, Supabase realtime persistence, HR/payroll, and fleet remain later phases. A production AI model and persistent document intelligence also belong to the backend phase.

**Will demo changes remain forever?**

No. They remain during the running mock session and reset with the serverless process. Persistence is the next backend phase.
