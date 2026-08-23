# MIPRO ERP Frontend Video Script

## Goal

Record a confident 16-18 minute client walkthrough that proves this is one connected operating flow, not a collection of static pages. Follow one story from import costing to stock, sale, collection, expense, report, and permission control.

Use clear business language. Mention the API only to explain that actions are connected and backend-ready.

---

## Before Recording

1. Open the deployed site in a clean browser window at 1440 x 900 or larger.
2. Confirm `/api/health` returns a successful response.
3. Use Chrome or Edge at 100% zoom.
4. Start on the public landing page.
5. Keep `superadmin@mipro.local` and `password123` ready.
6. Do not pre-finalize LC-77612 if you intend to demonstrate finalization and receiving.
7. Close personal bookmarks, notifications, and unrelated browser tabs.
8. Record at 1080p when possible.

Move the pointer slowly, pause after every click, and keep the current heading visible while speaking.

---

## Timeline

| Time | Screen | Main message |
|---|---|---|
| 00:00-01:10 | Landing | Two connected business flows, seven areas |
| 01:10-02:10 | Login | Fixed role identity and capability control |
| 02:10-03:25 | Dashboard | Six role-safe KPIs and action lists |
| 03:25-07:45 | Import workspace | One LC, many products, dynamic costs |
| 07:45-09:10 | Cost result/finalization | Exact, explainable, immutable costing |
| 09:10-10:35 | Warehouse/inventory | Receiving, batches, FIFO, expiry |
| 10:35-13:40 | Sales | Customer -> quote -> order -> delivery -> collection |
| 13:40-14:50 | Expenses & Accounts | Operating money without full GL |
| 14:50-15:45 | Reports/print | Same data summarized and printed |
| 15:45-16:45 | Settings | Capabilities and confirmation queue |
| 16:45-17:40 | Second role | Navigation and direct-URL denial |
| 17:40-18:00 | Close | Frontend complete, backend-ready, honest scope |

---

## 00:00-01:10 - Landing Page

### Show

1. Start at `/`.
2. Keep the product name and main headline in view.
3. Scroll slowly through import, inventory, sales, and trust/metric sections.
4. Point to the button that opens the ERP.

### Say

> This is the simplified MIPRO Medical Supplier ERP frontend. The latest client discussion showed that the business has two main flows. The first brings a shipment from supplier and LC or TT through landed cost into stock. The second moves that stock through quotation, order, delivery and collection.

> Warehouse inventory connects those two flows. Instead of more than forty separate destinations, the application now has a maximum of seven business areas. Detailed stages remain inside the workflow where the user expects them.

> The public design keeps the industrial Chinese enterprise direction, while the operational application is compact and practical for repeated daily work.

---

## 01:10-02:10 - Login And Fixed Role

### Show

1. Click **Open ERP** or **Sign in**.
2. Point to the available role identities.
3. Choose Super Admin.
4. Enter `password123`.
5. Sign in.

### Say

> Every employee signs in under a real assigned role. This selector exists only to make prototype demonstrations quick. Once signed in, the role cannot be changed from the main page.

> In production the owner creates the user and assigns a role and any special capabilities in Settings. The application checks both page access and sensitive actions.

---

## 02:10-03:25 - Dashboard

### Show

1. Pause on the six KPI cards.
2. Point to Sales, Collections, Receivable, Operating Expenditure, Inventory Value, and Imports in Progress.
3. Scroll through Action Queue, Expiry Awareness, Customer Dues, Recent Activity, and Expense Pulse.

### Say

> The dashboard is not trying to become another module. It gives this role no more than six safe KPIs plus records that need action.

> The same dashboard changes by role. The owner may see inventory value, while a sales user sees only permitted own-record totals. Sensitive product cost is not sent to an unauthorized user.

> The lists are actionable: an import waiting for costing, a visible expiry, a customer due, a recent collection, or a recent office expense all lead back to the underlying operational record.

---

## 03:25-04:10 - Imports List

### Show

1. Open **Imports**.
2. Point to search and status filters.
3. Point to draft references and LC/TT primary references.
4. Open **LC-77612**.

### Say

> Each row is one shipment or consignment, and it may contain several products. Before an LC exists the system generates an internal reference such as IMP-2026-001.

> When the LC is opened, LC-77612 becomes the main visible business reference. The internal record stays the same, so no data is copied into a second module.

---

## 04:10-05:15 - Commercial And Shipment Sections

### Show

1. Point to the milestone strip.
2. Expand **Commercial & Products**.
3. Show supplier, PO, PI, and three product variants with images.
4. Point to each product's quantity, FOB, cartons, and CBM.
5. Expand **LC / TT & Shipment**.
6. Show bank, rate snapshot, BL, container, vessel, ETD, and ETA.

### Say

> The milestone shows where this consignment currently sits, from draft and PI through LC, production, shipment, port, costing and receiving.

> One record contains Dialyzer, Blood Line Sets and AV Fistula. Each has its own quantity, FOB value, cartons, CBM and assessed duty basis. That difference is essential because shared cost cannot be divided correctly with one simple quantity formula.

> The exchange rate is stored as a historical transaction snapshot. A future market-rate change does not silently alter a finalized historical landed cost.

---

## 05:15-05:50 - Documents

### Show

1. Expand **Documents**.
2. Point to PI, LC, BL and customs assessment entries.
3. Click the upload icon and briefly show the metadata form, then close it.

### Say

> Commercial evidence remains attached to the same case. The frontend currently stores file metadata through a file service boundary. Real storage can replace that boundary without changing this workspace.

---

## 05:50-07:45 - Dynamic Cost Allocation

### Show

1. Expand **Costs & Allocation**.
2. Point to sea freight, product duties, bank fee, insurance, C&F, gate, port, transport and labour.
3. Click **Add Cost**.
4. Point to Cost Name, Category, Amount, Currency, Exchange Rate, Product Scope, Allocation Method, Vendor, Payment, Notes, and Attachment.
5. Open the allocation list and mention all five choices.
6. Close without saving unless you want to add a harmless demo row.

### Say

> This is the most important client-specific part. A new charge never requires a developer to add another hard-coded calculator field. The user clicks Add Cost, names the real charge and chooses how it affects the products.

> Sea freight can use CBM. A shared bank charge can use FOB value. Handling can use quantity. Final customs duty is entered against the assessed product. An exceptional documented case can use a manual split.

> Common and local transport costs still require an explicit choice on every row because the client has not confirmed permanent defaults.

> The system stores foreign amount, currency, exchange-rate snapshot, BDT amount, scope, vendor, payment information, notes and attachment metadata. Office rent, salaries, utilities and TA/DA never belong here.

---

## 07:45-09:10 - Cost Preview And Finalization

### Show

1. Expand **Landed-Cost Result**.
2. Click **Preview**.
3. Point to FOB value, allocated import costs, and final shipment cost.
4. Point to final landed cost per unit for each product.
5. Expand **Explain allocations** for one product.
6. Point to the allocation basis, share, allocated amount and per-unit result.
7. If the demo data is clean, click **Finalize Snapshot** and confirm the status.

### Say

> Clicking Preview sends the current import case to the controlled costing API. The API checks permission and inputs, runs Decimal.js financial logic, then returns exact product totals and readable explanations.

> Calculations use higher precision internally and display BDT to two decimals. Any residual poisha is assigned deterministically, and every product allocation sums exactly to the original cost.

> Customs duty itself is not guessed by the software. The user enters the final official assessed amount per product.

> Finalize creates an immutable landed-cost snapshot. Warehouse receipts inherit this cost. Reopening requires an owner capability, a reason, and an audit entry; it never rewrites history invisibly.

---

## 09:10-09:50 - Warehouse Receipt

### Show

1. Expand **Warehouse Receipt & Activity**.
2. If finalized, click **Receive to Warehouse**.
3. Show received/rejected quantity, lot, batch, manufacturing date, expiry, warehouse, and location.
4. Explain that a partial receipt can be saved, then close or submit selected valid rows.

### Say

> Receiving is locked until landed cost is finalized. The warehouse enters only physical receiving facts.

> Product, import reference and per-unit landed cost come from the finalized case. The API prevents over-receiving, negative quantities and expiry earlier than manufacturing.

> Partial receipts stay under the same LC. Each posting creates stock batches and stock-in movements.

---

## 09:50-10:35 - Inventory And FIFO

### Show

1. Open **Inventory**.
2. Show Stock cards with product image, canonical code, available quantity, FIFO lot and nearest expiry.
3. Open **Batches**.
4. Point to Issue First, receipt date, lot, batch, expiry and location.
5. Open **Movements**.

### Say

> Inventory is the bridge between imports and sales. Product names are canonical variants so spelling differences from old worksheets do not create duplicate stock.

> Dispatch uses FIFO: the oldest eligible matching receipt is recommended first. Expiry is still visible and alertable. Choosing a newer lot while an older lot has stock creates a warning. A capable user needs a written reason to override it, and that action is audited.

---

## 10:35-11:30 - Customer Ledger

### Show

1. Open **Sales**.
2. Stay on **Customers**.
3. Point to customer type, territory, contact, sales, collected, due and progress.
4. Open **New Customer**, then close it.

### Say

> The old customer-specific spreadsheet tabs are normalized into one customer table and one transaction ledger. Search and reports no longer depend on opening a different sheet for each hospital, clinic, dealer or pharmacy.

---

## 11:30-12:25 - Quotation And Order

### Show

1. Open **Quotations & Orders**.
2. Click **New Quotation**.
3. Select a customer and product.
4. Point to quantity, historical selling price and total.
5. Save if desired.
6. Show the quotation print icon.
7. Show the Convert action on an accepted quotation.

### Say

> Sales selects a customer and canonical product, creates the quotation and prints either a digital-letterhead or preprinted-letterhead version from the same record.

> When accepted, Convert creates the order with the same line items. No one retypes product, quantity or price. Invoice is not forced into the flow because that requirement is still awaiting client confirmation.

---

## 12:25-13:05 - Delivery

### Show

1. Open **Deliveries**.
2. Click **New Delivery** if available.
3. Choose an undelivered order.
4. Point to the recommended batch and expiry.
5. Select a newer lot temporarily to show the FIFO warning, then return to the recommended lot.
6. Point to receiver and challan print.

### Say

> A delivery selects the actual physical batch. The API validates available quantity and the FIFO recommendation before posting.

> Posting the challan creates a stock-out movement, reduces the chosen batch, updates the order status and records the amount as customer due.

---

## 13:05-13:40 - Collection

### Show

1. Open **Collections**.
2. Click **Record Collection**.
3. Select customer, related order, amount, payment method and account.
4. Point to Cash, bKash/mobile banking, bank transfer and cheque options.
5. Show an existing money-receipt print.

### Say

> A collection can be full or partial. Posting reduces both the customer due and related order due, then adds a credit to the selected cash or bank account.

> The money receipt comes from the same collection record. Outstanding credit simply remains visible as due.

---

## 13:40-14:50 - Expenses And Accounts

### Show

1. Open **Expenses & Accounts**.
2. Show daily expenses.
3. Open **New Expense**.
4. Point to category, general or TA/DA subtype, account, amount, remarks and attachment.
5. Show cash/bank accounts and transaction ledger.
6. Point to a reversal action.

### Say

> This area tracks the operational money the client asked for: daily expenses, TA/DA, cash and bank, collections, customer dues and a simple transaction ledger.

> A posted expense reduces the selected account. If it is wrong, Accounts reverses it with a reason instead of deleting financial history.

> Most importantly, these operating expenses never alter the import's landed-cost snapshot.

---

## 14:50-15:45 - Reports And Print

### Show

1. Open **Reports**.
2. Move across Import & Cost, Inventory, Sales & Collection, Expense & Cash/Bank.
3. Point to the chart and CSV/print commands.
4. Open the narrow Audit view.
5. Open one print preview in another tab if convenient.

### Say

> Reports use the same operational records; they are not manually maintained copies. Users see only the report groups and sensitive values their role permits.

> The narrow audit focuses on important risk: cost finalization or reopening, receiving, FIFO override, stock dispatch, collection, expense reversal and permission changes.

---

## 15:45-16:45 - Settings And Open Decisions

### Show

1. Open **Settings**.
2. Show **Client Confirmation Queue**.
3. Point to each pending decision and its currently disabled behavior.
4. Open Users & Capabilities, Products, Suppliers and Business Setup.
5. Point to user image, fixed role, capabilities, product images, accounts, warehouse and print identity.

### Say

> Settings is owner-only. It manages users and capabilities, products, suppliers, accounts, warehouse, expense categories, cost presets and print identity.

> The confirmation queue is deliberate. Questions such as invoice requirement, accounting depth, warehouse count, sales tax and finalization authority are visible rather than silently hard-coded.

---

## 16:45-17:40 - Prove Role Access

### Show

1. Use the profile menu and sign out.
2. Sign in as `sales1@mipro.local` with `password123`.
3. Show the smaller navigation: Dashboard and Sales.
4. Open Sales and point to **My Customers** and **My Quotes & Orders**.
5. Type `/app/accounts` in the address bar.
6. Show **Access denied**.

### Say

> This is not a cosmetic role switch. The Sales Executive receives a small own-record web workspace and cannot see import costing, accounts, reports or settings.

> Even a direct URL is denied. The API also filters customers and sales records by owner and does not send sensitive cost fields.

---

## 17:40-18:00 - Closing

### Say

> This release completes the latest simplified frontend scope: one multi-product import workspace, deterministic landed cost, finalized receiving, FIFO batch stock, quotation through collection, operational expenses, reports, settings, role access and print views.

> Every screen uses typed API services and validated responses, so a persistent backend can replace the in-memory Express demo without rebuilding the frontend workflow.

> The mock data is temporary and can reset when the server restarts. Real database, storage and authentication are the next production phase after the client approves this workflow.

---

## Plain-Language API Explanation

Use this only if the client asks what an API proves:

> Think of the API as a controlled office messenger. The page does not directly change hidden data. It sends a clear request such as "finalize this import" or "deliver ten pieces from this batch." The API checks who is asking, validates the business rules, updates every connected record and returns the result. That is why one delivery can reduce stock and create customer due without re-entry.

Do not open developer tools unless the audience asks. If needed, show one Network request and explain only:

- request name;
- user action that caused it;
- successful status;
- returned business result.

---

## Recording Safety Notes

- If a mutation was already performed, restart the local API or redeploy to restore the seed.
- Vercel serverless memory can reset; this is expected for the frontend approval build.
- Do not say uploaded files are permanently stored.
- Do not say the prototype is a production database.
- Do not claim AI, GPS, HR, payroll, fleet, invoice, full accounting or automatic customs calculation.
- If a table is wide on mobile, demonstrate its intentional horizontal scroll area.
- If product images do not appear, verify `/medical-products.png` is deployed.
- If an API request fails locally, confirm both ports are running and `/api/health` succeeds.

---

## Final Recording Checklist

- [ ] Landing and login are visible.
- [ ] Role cannot be changed after login.
- [ ] Exactly seven possible main destinations are explained.
- [ ] Dashboard has no more than six KPIs.
- [ ] LC-77612 shows several products.
- [ ] All five allocation methods are mentioned.
- [ ] Allocation explanation and exact reconciliation are shown.
- [ ] Customs formulas are explicitly not automated.
- [ ] Finalization and receiving connection is explained.
- [ ] FIFO and expiry awareness are both explained.
- [ ] Quotation lines carry into order.
- [ ] Delivery reduces an actual batch.
- [ ] Collection reduces due and updates an account.
- [ ] Operating expenses remain separate from landed cost.
- [ ] Settings confirmation queue is shown.
- [ ] Sales Executive access denial is demonstrated.
- [ ] Temporary mock persistence is stated honestly.
- [ ] Backend-ready API boundary is explained in plain language.

