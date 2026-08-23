# MIPRO Medical Supplier ERP

## Client Presentation Guide

**Build:** Simplified workflow-driven frontend replacement

**Primary requirement:** `files/Medical_Supplier_ERP_Simplified_Plan.md`
**Purpose:** Explain what the system does, how information moves, who performs each action, and what the prototype proves.

---

## 1. The One-Minute Explanation

MIPRO ERP connects two real business flows through warehouse stock:

```text
IMPORT AND LANDED COST
Supplier -> PO/PI -> LC or TT -> Shipment -> Costs -> Finalized landed cost
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

- Exactly seven possible main destinations.
- One import workspace instead of separate PI, PO, LC, shipment, customs, costing, and GRN pages.
- One sales workspace instead of disconnected quotation, order, challan, and collection pages.
- FIFO issue recommendation with expiry always visible.
- Sensitive product cost and profit protected by explicit capability.
- Narrow operational accounts, not a premature full accounting package.
- Realistic local medical product images and client-like sample records.

### Intentionally deferred

- AI command center and floating chatbot
- GPS and field-sales map
- Native mobile application
- HR and payroll
- Fleet management
- Full general ledger, trial balance, and balance sheet
- Automatic customs, VAT, AIT, or HS-code duty formulas

These are not missing implementation. They are excluded by the latest simplified scope so the prototype follows the client's real workflow.

---

## 3. Main Navigation

| Area | Business purpose |
|---|---|
| Dashboard | Role-safe KPIs and items requiring action |
| Imports | One case from commercial setup through cost and receiving |
| Inventory | Stock, batches, expiry awareness, and movement history |
| Sales | Customers, quotations/orders, deliveries, and collections |
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
| Sales Executive | Dashboard, Sales | Own customers, quotations/orders, and collections only |

Directly typing an unauthorized URL still shows **Access denied**. The server also checks the role and capability; hiding a menu item is not the only control.

### Sensitive capabilities

- `view_sensitive_cost`
- `edit_sensitive_cost`
- `finalize_landed_cost`
- `reopen_landed_cost`
- `view_profit`
- `approve_stock_override`
- `manage_users`
- `approve_special_price`

The Super Admin is the temporary sole landed-cost finalizer/reopener until the client confirms another authority.

---

## 5. Demo Login

All active demo users use:

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
| Product | Super Admin | Super Admin | Delete only when unreferenced; otherwise deactivate | Super Admin | Canonical item used by import, stock, and sales |
| Supplier | Super Admin | Super Admin | Delete only when unreferenced | Super Admin | Reused by import cases |
| Import commercial data | Import Officer or Super Admin | Same roles before finalization | Draft/unposted case only | No separate approval | One connected import case |
| Import product line | Import Officer or Super Admin | Same roles before finalization | Before cost finalization | No separate approval | Quantity, FOB, CBM, and HS reference |
| Import document metadata | Import users | Import users | Protected after transaction use | No separate approval | PI, LC, BL, customs, and other document reference |
| Import cost line | User with `edit_sensitive_cost` | Same capability before finalization | Before finalization | Owner reviews through preview | Named cost and allocation rule |
| Landed-cost snapshot | System calculates | Immutable after finalization | Never physically deleted | `finalize_landed_cost` | Historical per-product/per-unit cost |
| Reopen landed cost | Not applicable | Authorized owner with reason | Old snapshot remains in history | `reopen_landed_cost` | Audited correction cycle |
| Warehouse receipt | Warehouse Manager or Super Admin | Posted as a receipt transaction | No silent delete | Receiving user posts | Batch/lot stock and stock-in movement |
| Customer | Sales Manager, Sales Executive, Super Admin | Owner-scoped for Sales Executive | Only when no protected transactions | No approval in current scope | One normalized customer ledger |
| Quotation | Sales Manager, Sales Executive, Super Admin | Draft/active quote owner | Draft/rejected only | Accepted quote converts to order | Carries lines forward |
| Sales order | Created from accepted quotation | No duplicate line entry | Cancel rules belong to production backend | Conversion action | Delivery-ready commercial commitment |
| Delivery challan | Warehouse Manager, Sales Manager, Super Admin | Posted transaction | No silent delete | Dispatch user posts | Actual batch stock-out and customer due |
| FIFO override | Authorized dispatch user | Reason is required | Audit event is permanent | `approve_stock_override` | Newer lot may be used exceptionally |
| Collection | Accounts, Sales Manager, Sales Executive, Super Admin | Production will use reversal/correction | No silent delete | Posting user | Reduces due and increases chosen account |
| Expense | Accounts or Super Admin | Correct through reversal | Reverse with reason | Accounts/Super Admin posts | Reduces selected cash/bank account |
| Expense category | Super Admin | Super Admin | Protect referenced categories | Super Admin | Dynamic daily expense classification |
| User/capabilities | Super Admin | Super Admin | Deactivate rather than erase history | Super Admin | Route, action, and sensitive-field access |
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

### 7.3 Sales consumes stock

```text
Customer -> Quotation -> Accepted -> SalesOrder
                                      |
                                      v
                            Delivery + selected StockBatch
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

Line items carry forward from quotation to order. The warehouse chooses the actual batch at delivery. The API checks quantity and FIFO before reducing stock.

### 7.4 Expenses stay isolated

```text
Daily Expense or TA/DA -> Selected Cash/Bank Account -> Account Transaction

No connection to ImportCostLine or LandedCostSnapshot
```

Rent, salaries, utilities, office transport, entertainment, and TA/DA never change product landed cost.

---

## 8. Import Workspace Walkthrough

Open **Imports**, then select **LC-77612**. The page represents one multi-product consignment.

### Milestone header

The status path includes:

```text
Draft -> PI Received -> LC/TT Opened -> In Production -> Shipped
-> At Port -> Costing -> Cost Finalized -> Partially Received
-> Received -> Closed
```

Cancelled is also supported.

### Six sections

1. **Commercial & Products**
   Supplier, PO, PI, payment mode, products, quantities, FOB, cartons, and CBM.

2. **LC / TT & Shipment**
   LC/TT reference, bank, rate snapshot, BL, container, vessel, ETD, and ETA.

3. **Documents**
   File metadata for PI, LC, BL, customs assessment, and other evidence.

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

---

## 9. Inventory Walkthrough

Inventory has only three internal views:

- **Stock:** available quantity by canonical product, with image, sale price, FIFO lot, and nearest expiry.
- **Batches:** lot, batch, import reference, receipt date, manufacturing/expiry, warehouse location, and available quantity.
- **Movements:** stock-in and stock-out transaction history.

### FIFO with expiry awareness

FIFO means the oldest eligible matching receipt is recommended first. Expiry is always shown. Selecting a newer batch while an older eligible batch still has stock produces a warning.

An authorized override requires:

1. `approve_stock_override` capability.
2. A written reason.
3. A permanent audit event.

The server prevents negative stock, receipt quantities beyond the import quantity, and an expiry date earlier than manufacturing date.

---

## 10. Sales Walkthrough

Sales has four internal views:

1. **Customers**
2. **Quotations & Orders**
3. **Deliveries**
4. **Collections**

### Customer ledger

The customer's historical spreadsheet tab becomes one customer row plus connected transactions. It shows total sales, total collected, outstanding due, credit limit, territory, contact, and collection progress.

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

### Print outputs

One record can produce:

- Quotation on digital letterhead
- Quotation for preprinted letterhead
- Sales order
- Delivery challan
- Money receipt
- Import cost statement

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

Reports read the same records used by operations. There is no duplicate reporting dataset. CSV export and print are available where appropriate.

The narrow audit captures high-risk actions such as:

- landed-cost finalization or reopening
- allocation changes
- warehouse receiving
- FIFO override
- stock dispatch
- collection posting
- expense reversal
- capability changes

---

## 13. Settings And Client Confirmation Queue

Settings is for Super Admin only.

It contains:

- Users and capabilities
- Products with medical product imagery
- Suppliers
- Cash and bank accounts
- Main warehouse
- Expense categories
- Import cost presets
- Print identity/configuration
- Client Confirmation Queue

The queue makes unresolved requirements visible:

- Default allocation for common costs
- Default allocation for local transport
- Invoice requirement
- Accounting depth
- Number of warehouses
- Selling-price approval
- Sales VAT/tax
- Cost-finalization authority

The prototype does not silently convert these questions into permanent business rules.

---

## 14. What An API Call Means

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

## 15. API Map

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
| `POST/PATCH/DELETE /api/imports/:id/items/*` | Maintain products within the same case |
| `POST/PATCH/DELETE /api/imports/:id/costs/*` | Maintain sensitive named cost rows |
| `POST /api/imports/:id/documents` | Attach document metadata |
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
| `POST /api/inventory/dispatch-preview` | Check quantity and FIFO recommendation |

### Sales

| Method and path | Purpose |
|---|---|
| `GET/POST/PATCH/DELETE /api/customers/*` | Customer master/ledger |
| `GET/POST/PATCH/DELETE /api/quotations/*` | Quotation workflow |
| `POST /api/quotations/:id/convert` | Carry quote lines into an order |
| `GET /api/orders` | List sales orders |
| `GET/POST /api/deliveries` | Post actual batch delivery and stock-out |
| `GET/POST /api/collections` | Post money receipt and reduce due |

### Accounts, reports, and settings

| Method and path | Purpose |
|---|---|
| `GET/POST /api/expenses` | Read/post operating expense |
| `POST /api/expenses/:id/reverse` | Reverse with reason |
| `GET /api/accounts` | Cash/bank positions |
| `GET /api/account-transactions` | Simple transaction ledger |
| `GET /api/reports` | Grouped role-safe report values |
| `GET/POST/PATCH/DELETE /api/products/*` | Product master |
| `GET/POST/PATCH/DELETE /api/suppliers/*` | Supplier master |
| `/api/settings/*` | Users, decisions, accounts, warehouse, presets, and print |
| `GET /api/audit` | Narrow high-risk audit trail |

---

## 16. Temporary Data Behavior

This release is a complete functional frontend backed by an in-memory Express API.

During a running demo, create/edit/delete/finalize/receive/deliver/collect/reverse actions work and connected screens update. The data is temporary:

- a local API restart resets the seed;
- a Vercel function cold start or redeployment may reset it;
- different serverless instances may not share the same memory;
- uploaded files are metadata only.

This is correct for frontend workflow approval. Production requires persistent authentication, database, storage, authorization, audit retention, backups, and transactions, with Supabase/Postgres being the planned replacement.

---

## 17. Four Acceptance Scenarios

### A. Multi-product import costing

- One LC contains Dialyzer, Blood Line Sets, and AV Fistula.
- Products have different quantities, FOB values, CBM, and assessed duty.
- Costs use all five allocation methods.
- Every cost and final shipment total reconcile exactly.
- Finalization creates an immutable snapshot.
- Partial and final receipt create stock at inherited cost.

### B. FIFO stock selection

- An older lot and newer lot both have stock.
- Dispatch recommends the older lot.
- Selecting the newer lot shows a warning.
- Authorized override requires a reason and audit entry.

### C. Quotation to collection

- Create a quotation.
- Convert it without re-entering lines.
- Post delivery from an actual batch.
- Stock decreases.
- Customer due increases.
- Collection reduces due and updates the chosen account.

### D. Expense isolation

- Post general office expense and TA/DA.
- Expense/account reports update.
- Finalized import and product landed costs do not change.

These scenarios are covered by automated unit, API-flow, role, and browser smoke tests.

---

## 18. Recommended Live Presentation Order

1. Landing page: explain the two flows and shared warehouse bridge.
2. Login: choose Super Admin and explain fixed role identity.
3. Dashboard: show no more than six KPIs and action lists.
4. Imports: open LC-77612.
5. Import sections: show one record accumulating all commercial, shipment, document, cost, result, and receipt data.
6. Cost preview: expand an allocation explanation and explain exact reconciliation.
7. Inventory: show product images, stock, batches, expiry, and FIFO.
8. Sales: show customer ledger and quotation-to-order connection.
9. Deliveries: explain actual batch selection and stock-out.
10. Collections: explain due and account update.
11. Expenses & Accounts: prove operating costs stay separate.
12. Reports: show grouped summaries and narrow audit.
13. Settings: show users/capabilities and pending client decisions.
14. Sign out and sign in as Sales Executive: prove the smaller own-record navigation and direct-URL denial.

---

## 19. Honest Production Position

### Complete in this release

- Simplified route and navigation architecture
- Role and capability-aware frontend/server behavior
- Connected import, costing, receipt, stock, sales, collection, expense, report, and settings flows
- Deterministic Decimal.js allocation engine
- Typed DTO/domain services and Zod response validation
- Print previews
- Responsive desktop/mobile frontend
- Vercel-compatible same-origin mock API
- Automated acceptance coverage

### Required for production backend phase

- Persistent database and file storage
- Real authentication and password/email delivery
- Server/database transactions and row-level security
- Durable audit history
- PDF generation/storage and document upload
- Excel migration/import tooling
- Backups, monitoring, and operational deployment controls

The frontend is ready for client workflow approval and backend integration. It must not be represented as a live production database.

---

## 20. Likely Client Questions

**Why are there fewer tabs now?**

Because PO, PI, LC, shipment, costs, and receiving are stages of one import job. Fewer destinations reduce duplicate entry and training effort.

**Can one LC contain multiple products?**

Yes. LC-77612 demonstrates different products, quantities, FOB values, CBM, and duty under one import case.

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

**Where is invoice generation?**

The latest client flow is quotation -> order -> challan -> collection. Invoice is shown in the confirmation queue until the client defines whether it is mandatory or optional.

**Where are AI, GPS, HR, and fleet?**

They were intentionally retired from this phase by the latest simplified plan. The core web data model can support later mobile/AI phases after the operational flow is approved.

**Will demo changes remain forever?**

No. They remain during the running mock session and reset with the serverless process. Persistence is the next backend phase.
