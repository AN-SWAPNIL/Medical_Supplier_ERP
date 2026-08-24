# MIPRO ERP Frontend Video Script

## Goal

Record a confident 22-23 minute client walkthrough that proves this is one connected operating flow, not a collection of static pages. Follow one story from import evidence and costing to stock, sale, collection, expense, employee reporting, field activity, contextual assistance, and permission control.

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
| 02:10-03:25 | Dashboard | Six role-safe KPIs, action lists and smart alerts |
| 03:25-07:45 | Import workspace | One LC, many products, protected documents, dynamic costs |
| 07:45-09:10 | Cost result/finalization | Exact, explainable, immutable costing |
| 09:10-10:35 | Warehouse/inventory | Receiving, batches, FIFO, expiry |
| 10:35-13:40 | Sales | Customer -> quote -> order -> delivery -> collection |
| 13:40-14:50 | Expenses & Accounts | Operating money without full GL |
| 14:50-16:20 | Reports/print | Employee/date reporting from owned transactions |
| 16:20-18:20 | Field Team | Role-scoped map, timestamps, visits and stored-coordinate history |
| 18:20-19:15 | Smart Insights | Cross-workflow review queue without another sidebar module |
| 19:15-20:15 | Contextual AI | Page/employee context, sources and workflow-safe answers |
| 20:15-21:15 | Settings | Capabilities, access summary and confirmation queue |
| 21:15-22:35 | Second role | Own activity/report, direct denial and AI redaction |
| 22:35-23:00 | Close | Frontend complete, backend-ready, honest scope |

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
3. Show the Smart Operational Alerts, then scroll through Action Queue, Expiry Awareness, Customer Dues, Recent Activity, and Expense Pulse.

### Say

> The dashboard is not trying to become another module. It gives this role no more than six safe KPIs plus records that need action.

> The same dashboard changes by role. The owner may see inventory value, while a sales user sees only permitted own-record totals. Sensitive product cost is not sent to an unauthorized user.

> The lists are actionable: an import waiting for costing, a visible expiry, a customer due, a recent collection, or a recent office expense all lead back to the underlying operational record.

> The smart cards use the same role-safe records. They explain why an item matters and link to its source; they do not approve or post anything.

---

## 03:25-04:10 - Imports List

### Show

1. Open **Imports**.
2. Point to search and status filters.
3. Point to draft references and LC/TT primary references.
4. Open **New Import** briefly and show that only supplier, PO, product lines, optional target date and notes are required.
5. Return to the register and open **LC-77612**.

### Say

> Each row is one shipment or consignment, and it may contain several products. Before an LC exists the system generates an internal reference such as IMP-2026-001.

> Work begins from PO before PI or LC. When the PI arrives it is added inside the same workspace; when the bank opens LC, that number becomes the visible reference.

> When the LC is opened, LC-77612 becomes the main visible business reference. The internal record stays the same, so no data is copied into a second module.

---

## 04:10-05:15 - Commercial And Shipment Sections

### Show

1. Point to the milestone strip.
2. Expand **Commercial & Products**.
3. Show supplier, PO, PI, and three product variants with images.
4. Point to each product's quantity, FOB, cartons, and CBM.
5. Expand **LC / TT & Shipment**.
6. Show LC amount/open/expiry, bank, rate snapshot, commercial invoice, follow-up, BL, container, vessel, ETD, and ETA.
7. Point to the controlled next-milestone action and explain Cancel/Close without activating them.

### Say

> The milestone shows where this consignment currently sits, from draft and PI through LC, production, shipment, port, costing and receiving.

> Status is not a free dropdown. PI, LC, cost finalization and receipt derive their own states; production, shipment, port, cancellation and closure use controlled actions. Closed or cancelled records become read-only.

> One record contains Dialyzer, Blood Line Sets and AV Fistula. Each has its own quantity, FOB value, cartons, CBM and assessed duty basis. That difference is essential because shared cost cannot be divided correctly with one simple quantity formula.

> The exchange rate is stored as a historical transaction snapshot. A future market-rate change does not silently alter a finalized historical landed cost.

> The browser gives an immediate preview, but the API recomputes FOB and CBM from quantity, rate and cartons with Decimal arithmetic. A user cannot submit a fake authoritative total.

---

## 05:15-05:50 - Documents

### Show

1. Expand **Documents**.
2. Point to PI, LC/Swift, commercial invoice, packing list, certificate, BL and customs evidence types.
3. Click **View** on the PI and pause on the protected PDF viewer.
4. Point to file type, size, uploader, Open in New Tab and Download, then close it.
5. Click **Extract Fields** and show that every proposed field begins unchecked.
6. Explain **Apply Selected Fields**, then close without changing the import.

### Say

> Commercial evidence remains attached to the same case. The viewer requests the file through the API, which checks the signed-in user and document sensitivity before returning content. A guessed direct link does not bypass access control.

> Extract Fields is advisory. It proposes supplier, PI, date, currency, quantity or CBM values, but nothing is selected and nothing is overwritten automatically. A person reviews the source and applies only verified fields through the normal validation flow.

---

## 05:50-07:45 - Dynamic Cost Allocation

### Show

1. Expand **Costs & Allocation**.
2. Point to sea freight, product duties, bank fee, insurance, C&F, gate, port, transport and labour.
3. Open the freight attachment and explain that sensitive cost evidence uses the same cost permission.
4. Click **Add Cost**.
5. Point to Cost Name, Category, Amount, Currency, Exchange Rate, Product Scope, Allocation Method, Vendor, Payment, Notes, and Attachment.
6. Open the allocation list and mention all five choices.
7. Close without saving unless you want to add a harmless demo row.

### Say

> This is the most important client-specific part. A new charge never requires a developer to add another hard-coded calculator field. The user clicks Add Cost, names the real charge and chooses how it affects the products.

> Sea freight can use CBM. A shared bank charge can use FOB value. Handling can use quantity. Final customs duty is entered against the assessed product. An exceptional documented case can use a manual split.

> Local covered-van transport now defaults to CBM because the latest meeting confirmed volume-based treatment. Common bank, insurance and C&F costs still require an explicit method because their permanent default is not confirmed.

> The system stores foreign amount, currency, exchange-rate snapshot, BDT amount, scope, vendor, payment information, notes and a viewable supporting file. Office rent, salaries, utilities and TA/DA never belong here.

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

> Finalize creates an immutable landed-cost snapshot. Before receiving, the owner can reopen with capability and a reason while the previous snapshot remains in history. After the first warehouse receipt, ordinary reopen is blocked so inherited stock valuation cannot contradict the import record.

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
2. Show the FIFO/expiry recommendation card, then Stock cards with product image, canonical code, available quantity, FIFO lot and nearest expiry.
3. Open **Batches**.
4. Point to Import Receipt versus Opening Stock source, Issue First, receipt date, lot, batch, expiry and location.
5. Open **Movements**.

### Say

> Inventory is the bridge between imports and sales. Product names are canonical variants so spelling differences from old worksheets do not create duplicate stock.

> Dispatch uses FIFO: the oldest eligible matching receipt is recommended first. Expiry is still visible and alertable. Choosing a newer lot while an older lot has stock creates a warning. A capable user needs a written reason to override it, and that action is audited.

> One order line can consume several lots. If the oldest lot has 30 pieces and the next has 30, a 60-piece request returns two allocation rows. Expired stock is visible for control but is never recommended.

---

## 10:35-11:30 - Customer Ledger

### Show

1. Open **Sales**.
2. Stay on **Customers**.
3. Point to customer type, territory, contact, sales, collected, due and progress.
4. Use **Open detailed ledger** for one customer.
5. Point to the opening due, delivered sales, collections and running balance.
6. Open **New Customer**, then close it.

### Say

> The old customer-specific spreadsheet tabs are normalized into one customer table and one transaction ledger. Search and reports no longer depend on opening a different sheet for each hospital, clinic, dealer or pharmacy.

> Legacy sales and collections can be reconciled as one opening balance at cutover. New deliveries and collections continue the same running due without creating another customer worksheet.

---

## 11:30-12:25 - Quotation And Order

### Show

1. Open **Quotations & Orders**.
2. Click **New Quotation**.
3. Select a customer and product.
4. Point to quantity, price, discount and total.
5. As Super Admin, run the owner profit preview and show FIFO expected cost, profit per unit, margin, and loss warning behavior.
6. Save if desired.
7. Open the quotation print icon; show supplied MIPRO digital letterhead, preprinted-paper mode and the LED TRACKERS identity selector.
8. Show the Convert action on an accepted quotation and the Order Receiving Sheet print.

### Say

> Sales selects a customer and canonical product, creates the quotation and prints either a digital-letterhead or preprinted-letterhead version from the same record.

> Only an authorized owner receives the expected FIFO landed cost and profit/loss preview. A Sales Executive can propose the sale but cannot see confidential cost.

> When accepted, Convert creates the order with the same line items. No one retypes product, quantity or price. Invoice is not forced into the flow because that requirement is still awaiting client confirmation.

---

## 12:25-13:05 - Delivery

### Show

1. Open **Deliveries**.
2. Click **New Delivery** if available.
3. Choose an undelivered order.
4. Point to the automatic oldest-first allocation plan and each expiry.
5. Explain how the plan splits a quantity across batches when one lot is insufficient.
6. Select a newer preferred lot temporarily to show the FIFO warning, then return to Auto FIFO.
7. Point to receiver and challan print.

### Say

> A delivery requests a quantity; the API returns the actual physical batch plan. It validates non-expired available stock and can produce several delivery lines for one ordered product.

> Posting the challan creates stock-out movements, reduces every allocated batch, updates the order status and records the delivered amount as customer due.

---

## 13:05-13:40 - Collection

### Show

1. Open **Collections**.
2. Click **Post Collection**.
3. Select customer, related order, amount, payment method and account.
4. Point to Cash, bKash/mobile banking, bank transfer and cheque options.
5. Show an existing money-receipt print.

### Say

> A collection can be full or partial. Posting reduces both the customer due and related order due, then adds a credit to the selected cash or bank account.

> A real active destination account is mandatory, and non-cash modes require their bank, mobile or cheque reference. Credit is not a collection mode; an unpaid amount simply remains visible as due. The money receipt comes from the same posted collection.

---

## 13:40-14:50 - Expenses And Accounts

### Show

1. Open **Expenses & Accounts**.
2. Show daily expenses.
3. Open **New Expense**.
4. Point to category, general or TA/DA subtype, account, amount, remarks and attachment.
5. Open the seeded utility receipt image and point out the shared viewer.
6. Show cash/bank accounts and transaction ledger.
7. Point to a reversal action.
8. Mention the Daily Expenditure and monthly category report, then show the TA/DA Approved Sheet under Reports.

### Say

> This area tracks the operational money the client asked for: daily expenses, TA/DA, cash and bank, collections, customer dues and a simple transaction ledger.

> A posted expense reduces the selected account. If it is wrong, Accounts reverses it with a reason instead of deleting financial history.

> Most importantly, these operating expenses never alter the import's landed-cost snapshot.

---

## 14:50-16:20 - Reports And Employee Print

### Show

1. Open **Reports**.
2. Set From to `01 Aug 2026` and To to `31 Aug 2026`; point to Applied Scope.
3. Open **Sales & Collection**, then **Salesperson Performance**.
4. Keep **All Sales Employees** selected and show the comparison chart/table.
5. Select **Rafiq Ahmed**, show summary cards and the quotation/order/delivery/collection/customer/product detail tabs.
6. Click **Print Report**, then return to Reports.
7. Briefly move across Import & Cost, Inventory and Expense & Cash-Bank; show TA/DA employee filtering and Audit.

### Say

> Reports use the same operational records and API-applied date range; they are not manually maintained copies. CSV exports the visible filtered rows. Users see only the groups and sensitive values their role permits.

> Performance credit follows the business owner. If a manager creates an order or Accounts posts a collection for Rafiq's customer, the operator is recorded but Rafiq remains the sales owner. A Sales Executive can request only their own report, and this report never contains FOB, landed cost or profit.

> The narrow audit focuses on important risk: cost finalization or reopening, receiving, FIFO override, stock dispatch, collection, expense reversal and permission changes.

---

## 16:20-18:20 - Field Team Map And History

### Show

1. In **Sales**, open **Field Team**. Point out that it is an internal Sales view, not an eighth sidebar item.
2. Pause on the **Demo location feed** warning.
3. Show Active, Recent/Stale, Offline, Not Tracking and Visits Today counts.
4. Filter by territory and LIVE status, then select Rafiq from the employee list or map marker.
5. Point to employee ID, territory, last-updated timestamp, GPS accuracy, current customer and check-in time.
6. Switch to **Route / Visit History**. Select employee/date and show the coordinate polyline and visit timeline.
7. Click **Open Employee Report**, then use **View Field Activity** to return.

### Say

> This is the complete management side for future field sales. The current feed is explicitly demo data, but every marker uses real latitude and longitude through a typed API. Status is derived from timestamp and tracking-session state, so old coordinates are never called live. Route history connects stored points only; it does not invent distance from stops.

> Location is sensitive. Management sees the permitted team, a Sales Executive sees only self, and Accounts, Import and Warehouse receive an API denial. Customer visit verification is stored separately from periodic work tracking. The future mobile app will write to these same start, location, stop, check-in and check-out contracts.

---

## 18:20-19:15 - Smart Insights

### Show

1. Return to Dashboard and click **View All Insights**.
2. Filter **Inventory**, then **Field Team**.
3. Open one source record.
4. Dismiss one card and explain that no transaction changed.

### Say

> Smart Insights is a passive review queue for rule-backed exceptions. It reuses the same role-safe recommendation API as the floating assistant, but it does not recreate the old AI Command Center. A dismissal only clears the card in this frontend session; approval, posting and correction still happen in the source workflow.

---

## 19:15-20:15 - Contextual MIPRO AI

### Show

1. Return to `LC-77612` and click **Ask MIPRO AI** at bottom-right.
2. Point to the signed-in role and **Current import case** context.
3. Ask **Explain the current shipment stage**.
4. Ask **Which documents are missing?**.
5. Click a returned source link, then reopen the assistant on Reports and ask **Summarize this report period**.
6. Narrow the window briefly to show the near-full-screen mobile panel.

### Say

> The assistant is contextual rather than a separate AI module. It receives the current route, record ID and report period, then the API reads only records already allowed for this role.

> It can explain a deterministic allocation or FIFO recommendation, identify missing evidence, summarize the selected period and suggest a follow-up. It cannot finalize landed cost, dispatch stock, post a collection or bypass any approval.

> These answers are rule-backed mock intelligence behind typed endpoints. A production LangChain or LangGraph service can replace the server implementation later without rebuilding this interface.

---

## 20:15-21:15 - Settings And Open Decisions

### Show

1. Open **Settings**.
2. Show **Client Confirmation Queue**.
3. Point to a confirmed answer with source/value and a pending decision with disabled behavior.
4. Open Users & Capabilities, edit a user, and show the read-only **Role Access Summary**.
5. Open Data Migration and show Opening Batch plus Customer Balance forms.
6. Point to user image, fixed role, capabilities, product images, accounts, warehouse, cost presets and MIPRO/LED print calibration.

### Say

> Settings is owner-only. It manages users and explicit capabilities, and the access summary answers what each role will actually see without introducing a second permission system. It also holds canonical products and aliases, suppliers, accounts, warehouse, expense categories, cost presets, stationery identities and opening-data migration.

> Confirmed decisions retain the actual answer, notes, source, user and time. Local transport CBM and FIFO are confirmed. Invoice requirement, common-cost default, accounting depth, warehouse count, sales tax and finalization authority remain visible rather than silently hard-coded.

---

## 21:15-22:35 - Prove Role Access

### Show

1. Use the profile menu and sign out.
2. Sign in as `sales1@mipro.local` with `password123`.
3. Show the smaller navigation: Dashboard, Sales and Reports.
4. Open Sales and point to **My Customers** and **My Quotes & Orders**.
5. Open My Activity and show that no other employee is returned, then open Reports and show only this executive's performance.
6. Ask Field Team AI about another salesperson and show the refusal.
7. Open MIPRO AI and ask `What is the landed cost and profit margin?`; pause on the permission-safe refusal.
7. Type `/app/accounts` in the address bar and show **Access denied**.

### Say

> This is not a cosmetic role switch. The Sales Executive receives a small own-record web workspace: Sales plus their own report. They cannot see import costing, accounts, another employee's report or settings.

> Even a direct URL and an AI question are denied at the API boundary. Customers, transactions and employee reports are owner-filtered, and sensitive cost fields are never sent.

---

## 22:35-23:00 - Closing

### Say

> This release completes the latest audited frontend scope: PO-first imports, protected evidence, authoritative landed cost, receiving and FIFO stock, quotation through collection, operational expenses, salesperson reporting, contextual role-safe assistance, settings/access control and supplied-stationery print views.

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
- Present AI as a deterministic, role-safe prototype boundary, not as a production model or autonomous decision-maker.
- Do not call the demo feed production GPS or promise browser tracking after closure. Native mobile/Supabase tracking, HR, payroll, fleet, invoice, full accounting and automatic customs calculation remain later work.
- If a table is wide on mobile, demonstrate its intentional horizontal scroll area.
- If product images do not appear, verify the individual files under `/public/products/` are deployed.
- If an API request fails locally, confirm both ports are running and `/api/health` succeeds.

---

## Final Recording Checklist

- [ ] Landing and login are visible.
- [ ] Role cannot be changed after login.
- [ ] Exactly seven possible main destinations are explained.
- [ ] Dashboard has no more than six KPIs.
- [ ] PO-first draft creation and later PI/LC progression are explained.
- [ ] Status is action-derived; Cancel/Close are controlled terminal actions.
- [ ] LC-77612 shows several products.
- [ ] PI PDF, freight attachment and expense image viewer are shown.
- [ ] Extract Fields is shown with human review and no automatic overwrite.
- [ ] All five allocation methods are mentioned.
- [ ] Allocation explanation and exact reconciliation are shown.
- [ ] Customs formulas are explicitly not automated.
- [ ] Finalization and receiving connection is explained.
- [ ] Post-receipt landed-cost reopening is explicitly blocked.
- [ ] Opening stock, multi-batch FIFO and expired-stock exclusion are explained.
- [ ] Owner-only quotation profit/loss preview is shown.
- [ ] Quotation lines carry into order.
- [ ] Delivery can reduce several FIFO-allocated batches.
- [ ] Collection reduces due and updates an account.
- [ ] Customer running ledger is opened.
- [ ] Operating expenses remain separate from landed cost.
- [ ] Date-filtered report tables, actual CSV and TA/DA sheet are shown.
- [ ] All-employee comparison, individual employee details and employee print are shown.
- [ ] Contextual AI uses the current import/report and provides source links.
- [ ] Sales Executive AI cost refusal and own-only report are demonstrated.
- [ ] MIPRO digital, preprinted and Order Receiving Sheet views are shown.
- [ ] Settings confirmation queue is shown.
- [ ] Opening stock/customer balance migration and product aliases are shown.
- [ ] Sales Executive access denial is demonstrated.
- [ ] Temporary mock persistence is stated honestly.
- [ ] Backend-ready API boundary is explained in plain language.
