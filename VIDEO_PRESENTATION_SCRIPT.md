# MIPRO Digital Platform Video Script

## Goal

Record a confident 29-30 minute client walkthrough. First establish MIPRO's professional public website, then cross the Employee Portal boundary and prove that the internal ERP is one connected operating flow rather than a collection of static pages. Give the client-reviewed Sales & Marketing and Employees workflows enough time; one is where staff do the work, and the other is where authorized management manages and reviews people.

Use clear business language. Mention the API only to explain that actions are connected and backend-ready.

---

## Before Recording

1. Open the deployed site in a clean browser window at 1440 x 900 or larger.
2. Confirm `/api/health` returns a successful response.
3. Use Chrome or Edge at 100% zoom.
4. Start on the MIPRO corporate homepage.
5. Confirm the presentation deployment has `VITE_DEMO_MODE=true`; production should leave it unset.
6. Keep `superadmin@mipro.local` and `password123` ready.
7. Do not pre-finalize LC-77612 if you intend to demonstrate finalization and receiving.
8. Close personal bookmarks, notifications, and unrelated browser tabs.
9. Record at 1080p when possible.

Move the pointer slowly, pause after every click, and keep the current heading visible while speaking.

---

## Timeline

| Time | Screen | Main message |
|---|---|---|
| 00:00-01:30 | Corporate Home | MIPRO identity, products and public/private boundary |
| 01:30-02:30 | Products / Contact | B2B catalogue, documentation, map and inquiry |
| 02:30-03:20 | Employee Portal | Production-safe login and fixed role identity |
| 03:20-04:35 | Dashboard | Six role-safe KPIs, action lists and smart alerts |
| 04:35-08:55 | Import workspace | One LC, many products, protected documents, dynamic costs |
| 08:55-10:20 | Cost result/finalization | Exact, explainable, immutable costing |
| 10:20-11:45 | Warehouse/inventory | Receiving, batches, FIFO, expiry |
| 11:45-14:15 | Sales & Marketing | Daily activity, polling, lead/follow-up, funnel, plans and targets |
| 14:15-16:45 | Sales transactions | Customer -> quote -> order -> delivery -> collection |
| 16:45-17:40 | Expenses & Accounts | Structured attribution and operating money without full GL |
| 17:40-20:20 | Employees | Directory, image/profile, login account, roles and access boundaries |
| 20:20-22:45 | Activity & Field Team | Employee performance, follow-ups, map, route, visits and GPS controls |
| 22:45-24:15 | Reports/print | Preselected employee/period, More Filters, export and print |
| 24:15-25:00 | Smart Insights | Cross-workflow review queue without another sidebar module |
| 25:00-26:00 | Contextual AI | Page/employee context and safe answers |
| 26:00-27:00 | Settings | Business/master configuration and open decisions |
| 27:00-29:20 | Role proof | Delegated lifecycle, hidden Access & Roles, direct denial and redaction |
| 29:20-30:00 | Close | Functional frontend, backend-ready, honest scope |

---

## 00:00-01:30 - Corporate Homepage

### Show

1. Start at `/`.
2. Keep the registered logo and corporate navigation in view, then use the hero arrows to move between the product, hemodialysis and distribution messages.
3. Point out that the four counts describe published website content, not confidential ERP sales or stock statistics.
4. Filter Featured Products by a product family and select a supply-process stage.
5. Scroll through product categories, About MIPRO, documentation and resources.
6. Point to the visually separate Employee Portal button.

### Say

> This is the MIPRO digital platform. The public side presents MIPRO Healthcare Corporation, its medical product catalogue, documentation approach and business contact. It does not advertise ERP software or publish internal sales, stock, cost or role figures.

> Public products are deliberately separated from ERP product records. Visitors can review a product and contact sales, but cannot see landed cost, supplier price, stock valuation or internal aliases.

> The homepage is not hard-coded presentation artwork. Its hero slides, category order, public products, document records, resources and company contact details come through published content APIs that the owner can manage inside Settings.

> The Employee Portal is the boundary into the internal application. Employee accounts are provisioned by Super Admin, not requested by strangers on the public website.

---

## 01:30-02:30 - Products, Certificates And Contact

### Show

1. Open **Products**, search for `dialyzer`, and open the Hollow Fiber Hemodialyzer.
2. Point out that catalogue content contains no price, stock, supplier terms or landed cost.
3. Open **Certificates**, preview the UKCA scan, then close the viewer and point to Download.
4. Contrast its visible current date with the clearly marked expired EC and WHO/PQS records.
5. Open **Contact**, show the office-area map, choose a product, and submit an inquiry.

### Say

> The product catalogue supports institutional review rather than public checkout. A buyer selects the product family, then MIPRO confirms the exact model, documentation and commercial terms through quotation.

> These scans were migrated from MIPRO's previous public certificate page with company authorization. Each file names Jiangxi Hongda as the document holder, so the system never presents it as a MIPRO corporate certificate. It also distinguishes a currently dated record from expired or historical evidence and asks the buyer to verify the complete controlled set before relying on it.

> Preview and download are real browser actions. The contact form is also functional: it sends a validated API request and returns an inquiry reference. In non-technical language, that API call means the page passes the same structured inquiry to the server that a future database or sales workflow will receive; the screen will not need to be rebuilt when persistent storage is connected.

---

## 02:30-03:20 - Login And Fixed Role

### Show

1. Click **Employee Portal**.
2. Point to the available role identities.
3. Choose Super Admin.
4. Enter `password123`.
5. Sign in.

### Say

> Every employee signs in under a real assigned role. The production login is blank and contains no public account list. This selector appears only because this presentation deployment explicitly enables demo mode. Once signed in, the role cannot be changed from the main page.

> In production the owner creates the employee and login account in Employees, then assigns role and any special capabilities in Employees -> Access & Roles. The application checks navigation, direct routes, record scope, API data, documents and sensitive actions.

---

## 03:20-04:35 - Dashboard

### Show

1. Pause on the role-aware Quick Actions row and the six KPI cards.
2. Point to Sales, Collections, Receivable, Operating Expenditure, Inventory Value, and Imports in Progress.
3. Explain that a Sales Executive sees Report Activity, New Lead, New Quotation and My Reports, while other roles receive their own short action set.
4. Show the Smart Operational Alerts, then scroll through Action Queue, Expiry Awareness, Customer Dues, Recent Activity, and Expense Pulse.

### Say

> The dashboard is not trying to become another module. It gives this role no more than six safe KPIs plus records that need action.

> Quick Actions provide at most four permitted daily commands. They open the real connected form, not a decorative shortcut.

> The same dashboard changes by role. The owner may see inventory value, while a sales user sees only permitted own-record totals. Sensitive product cost is not sent to an unauthorized user.

> The lists are actionable: an import waiting for costing, a visible expiry, a customer due, a recent collection, or a recent office expense all lead back to the underlying operational record.

> The smart cards use the same role-safe records. They explain why an item matters and link to its source; they do not approve or post anything.

---

## 04:35-05:20 - Imports List

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

## 05:20-06:25 - Commercial And Shipment Sections

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

## 06:25-07:00 - Documents

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

## 07:00-08:55 - Dynamic Cost Allocation

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

## 08:55-10:20 - Cost Preview And Finalization

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

## 10:20-11:00 - Warehouse Receipt

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

## 11:00-11:45 - Inventory And FIFO

### Show

1. Open **Inventory**.
2. Show the FIFO/expiry recommendation card, then Stock cards with product image, approved variant code, available quantity, FIFO lot and nearest expiry.
3. Open **Batches**.
4. Point to Import Receipt versus Opening Stock source, Issue First, receipt date, lot, batch, expiry and location.
5. Open **Movements**.

### Say

> Inventory is the bridge between imports and sales. Product aliases map spelling differences from old worksheets to one approved variant so they do not create duplicate stock.

> Dispatch uses FIFO: the oldest eligible matching receipt is recommended first. Expiry is still visible and alertable. Choosing a newer lot while an older lot has stock creates a warning. A capable user needs a written reason to override it, and that action is audited.

> One order line can consume several lots. If the oldest lot has 30 pieces and the next has 30, a 60-piece request returns two allocation rows. Expired stock is visible for control but is never recommended.

---

## 11:45-14:15 - One-Click Sales & Marketing Hub

### Show

1. In **Sales & Marketing**, select **Marketing** and pause without opening another page.
2. Point to Today's Marketing KPIs, the “refreshes every 12 seconds” label, Activity, Follow-up Attention, Funnel, Needs Attention, Field Team shortcut, and the single Team Performance table.
3. Open **New Lead**, assign an executive, select product interest, set a first follow-up, and save.
4. Click an employee in Team Performance and show that management goes directly to **Employees -> Activity & Performance**. Return to Marketing.
5. Click the **Negotiation** funnel stage and prove the Lead Pipeline shows only Negotiation records. Show direct Follow-up and Report Visit actions, then explain Convert to Customer and Create Quotation without retyping context.
6. Open **Daily Plan** and show that each row selects a real permitted customer or lead. Point out that completion comes from field check-out, not a manual checkbox.
7. Open the Follow-up Queue and show both Complete with outcome and Reschedule with a new due time.
8. Open **More**, then show Daily/Monthly Plan and Set Target as permitted secondary actions.
9. Click **Generate Report** and show the practical daily, weekly, employee, funnel, overdue, target, verification, and custom presets.
10. Point to a Quotation, Order, Delivery, or Payment item in Activity and explain that it was generated automatically. Point to an older date-only transaction labelled **Time unavailable**.

### Say

> This is the client's daily Sales & Marketing workspace. One click opens the work itself: what happened today, what needs follow-up, where leads sit in the funnel, who is active, and how target performance is progressing. Management receives another API refresh every 12 seconds without reloading the page.

> Employees report only genuinely manual work such as a customer contact, presentation, sample, negotiation, or note. Their employee ID comes from login, so the form cannot claim another person's activity. Quotations, orders, deliveries, collections, check-ins, and check-outs come from their real ERP records automatically. No one reports the same event twice.

> The lead remains one connected record. A contact moves it forward, conversion creates the financial Customer, and the quotation carries the lead reference. Later order, delivery, and payment events advance the same funnel. The software never moves a lead backward or lets a manual note claim a payment.

> Plans and follow-ups are operational records, not loose notes. A daily-plan visit points to the permitted lead or customer, and only the matching field check-out marks it complete. A missed follow-up can be completed with an outcome or rescheduled to a validated new time while preserving its audit trail.

> The API call here simply means this form sends a structured lead or follow-up to the shared business service. That same saved record appears in activity, Employees performance, the follow-up queue, funnel, dashboard, AI context, and reports. A production database can replace temporary storage without rebuilding these screens.

> New quotation, order, delivery and collection events store their real created, submitted or posted time. Older rows that contain only a date say Time unavailable. The system never invents noon or another convenient-looking hour.

> Scope is enforced separately from page access. A Sales Executive sees self, a Sales Manager sees the active team, and the Managing Director or owner sees all sales employees. Accounts does not receive Marketing activity just because Accounts can post collections.

---

## 14:15-14:55 - Customer Ledger

### Show

1. Open **Sales & Marketing**.
2. Stay on **Customers**.
3. Point to customer type, territory, contact, sales, collected, due and progress.
4. Use **Open detailed ledger** for one customer.
5. Point to the opening due, delivered sales, collections and running balance.
6. Point to the row shortcuts for Marketing History, New Quotation and Post Collection; each opens with this customer already selected.
7. Open **New Customer**, then close it.

### Say

> The old customer-specific spreadsheet tabs are combined into one customer table and one running ledger. Search and reports no longer depend on opening a different sheet for each hospital, clinic, dealer or pharmacy.

> Legacy sales and collections can be reconciled as one opening balance at cutover. New deliveries and collections continue the same running due without creating another customer worksheet.

---

## 14:55-15:35 - Quotation And Order

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

> Sales selects a customer and approved product variant, creates the quotation and prints either a digital-letterhead or preprinted-letterhead version from the same record.

> Only an authorized owner receives the expected FIFO landed cost and profit/loss preview. A Sales Executive can propose the sale but cannot see confidential cost.

> When accepted, Convert creates the order with the same line items. No one retypes product, quantity or price. Invoice is not forced into the flow because that requirement is still awaiting client confirmation.

---

## 15:35-16:10 - Delivery

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

## 16:10-16:45 - Collection

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

## 16:45-17:40 - Expenses And Accounts

### Show

1. Open **Expenses & Accounts**.
2. Show daily expenses.
3. Open **New Expense**.
4. Change **Expense For** between Employee, Office, Warehouse, and Company / General.
5. Choose Employee, search Rafiq in the existing directory, and point to auto-filled ID/designation/department. Select TA/DA and show that an employee becomes mandatory.
6. Point to the 24 seeded categories, account, amount, remarks, attachment, and signed-in **Entered By** identity.
7. Open the seeded utility receipt image and point out the shared viewer.
8. Show cash/bank accounts, transaction ledger, and a reversal action.
9. Mention Expense by Person, Office/Warehouse, Category, Month, and TA/DA reports.

### Say

> This area tracks the operational money the client asked for: daily expenses, TA/DA, cash and bank, collections, customer dues and a simple transaction ledger. Expense For and Entered By are different: the first identifies who or which unit received the benefit; the second always comes from the logged-in user.

> A posted expense reduces the selected account. If it is wrong, Accounts reverses it with a reason instead of deleting financial history.

> Most importantly, these operating expenses never alter the import's landed-cost snapshot.

---

## 17:40-20:20 - Employees, Login Accounts And Access

### Show

1. Open **Employees** and point out the Management navigation group beside Reports.
2. In **Employee Directory**, search `SE-001`, then clear search and filter by department, role, status, and territory.
3. Point to employee image, ID, designation, department/territory, login email, role, status, and compact row actions.
4. Click **New Employee**. Show Profile, Employment, and Login Account sections, including image URL/Choose Image, login email, account status, initial role, and optional password. Close without saving.
5. Open Rafiq's profile and explain that profile and login remain one record.
6. Select **Access & Roles**. Open Tanvir or another lower-role employee.
7. Point to Role Default Access, Assigned Role, Employee-specific access, Additional Allow, Explicit Deny, Sensitive Capabilities, and optional password reset.
8. Close the editor and explain that every role/access change requires an authorized person and creates an audit event.

### Say

> Employees is now the direct management home for who works here, how they sign in, what they may access, where the field team is, and how the sales team is performing. It is not hidden inside generic Settings.

> This does not create a second employee database. The directory, login account, role, permission exceptions, Field Team and Marketing performance all refer to the same employee identity. There is no HR, payroll, leave or recruitment claim in this scope.

> Employee lifecycle and access administration are separate. A delegated manager may create or update a lower-role employee profile only when users View, Create, Edit and manage_users are all present. Role, password, Allow, Deny and sensitive capabilities require manage_user_access. A normal team manager does not see this Access & Roles tab.

> An explicit Deny wins over a role default. Additional Allow handles a genuine exception without inventing a new hybrid role. The API still blocks self-escalation, peers, higher roles, every Super Admin, and deactivation of the final active owner.

---

## 20:20-22:45 - Employee Activity And Field Team

### Show

1. Select **Activity & Performance**.
2. Choose **Rafiq Ahmed**, then change Period from Today to **This Month**.
3. Point to check-in/out, visits, verified visits, leads, follow-ups, presentations, samples, quotations, orders, delivered sales, collections, activity score, and target progress.
4. In the mixed timeline, point to manual activity plus Field Visit, Quotation, Order, Delivery, and Collection sources. Find an old row showing **Time unavailable**.
5. Show Sales, Visits, New Customers and Collection target progress, plus Today/Overdue/Upcoming follow-ups and Daily Plan when present.
6. Click **Full Report**, show that Reports receives Rafiq and the date range, then return to Employees.
7. Click **Field Map** or select **Field Team**. Pause on the **Demo location feed** warning.
8. Show Active, Recent/Stale, Offline, Not Tracking and Visits Today counts. Filter by territory and LIVE, then select Rafiq.
9. Point to employee ID, territory, last-updated timestamp, GPS accuracy, current customer and check-in time.
10. Switch to **Route / Visit History** and show the coordinate polyline and visit timeline.
11. Explain that **Sales & Marketing -> Open Field Team** routes management to this same shared view. A Sales Executive keeps only their own My Field Day, Start/Stop, Refresh GPS, Check In, and Complete Visit controls inside Marketing.

### Say

> Activity & Performance answers two manager questions without opening a large report builder: what did this employee do, and how are they progressing? Actual values come from the same Marketing, field, quotation, order, delivery and collection records. No one types an “actual” target result.

> New transactions use the real created, submitted or posted timestamp. Older imported rows that only contain a date say Time unavailable. That is more honest than inventing a noon or 1 PM time.

> Full Report is a cross-link, not a duplicate report implementation. It carries employee and period into Reports. Field Map opens the same shared Field Team component focused on the employee.

> Location is sensitive. Management sees the permitted team, a Sales Executive sees only self, and Accounts, Import and Warehouse receive an API denial. Status comes from timestamp and tracking-session state, so stale coordinates are never called live. Foreground web tracking works now; reliable background tracking remains a mobile-production concern.

---

## 22:45-24:15 - Reports And Employee Print

### Show

1. Open **Reports**.
2. Open **Marketing** from the Employee Full Report link and point out that employee and From/To period are already selected.
3. Show Employee and Summary/Detail as the normal controls. Click **More Filters**, search a Customer/Lead, then demonstrate Territory, Activity, Verification, Status, and Group By.
4. Clear the advanced filters, switch **Summary / Detail**, and point to activity, funnel, follow-up, target, score, and visit-verification tables.
5. Print the filtered report and show that CSV is protected by Marketing Export permission.
6. Open **Sales & Collection**, then **Salesperson Performance**.
7. Keep **All Sales Employees** selected and show the comparison metrics, then select Rafiq and open the A4 employee print.
8. Briefly show Import & Cost, Inventory, Expense & Cash-Bank, and Audit.

### Say

> Reports use the same operational records and API-applied period; they are not manually maintained copies. Normal report use stays simple, while More Filters exposes the deeper customer, territory, activity, verification, status and grouping controls only when needed. CSV exports visible filtered rows only after the server authorizes export.

> Performance credit follows the business owner. If a manager creates an order or Accounts posts a collection for Rafiq's customer, the operator is recorded but Rafiq remains the sales owner. A Sales Executive can request only their own report, and this report never contains FOB, landed cost or profit.

> The narrow audit focuses on important risk: cost finalization or reopening, receiving, FIFO override, stock dispatch, collection, expense reversal and permission changes.

---

## 24:15-25:00 - Smart Insights

### Show

1. Return to Dashboard and click **View All Insights**.
2. Filter **Inventory**, then **Field Team**.
3. Open one source record.
4. Dismiss one card and explain that no transaction changed.

### Say

> Smart Insights is a passive review queue for rule-backed exceptions. It reuses the same role-safe recommendation API as the floating assistant, but it does not recreate the old AI Command Center. A dismissal only clears the card in this frontend session; approval, posting and correction still happen in the source workflow.

---

## 25:00-26:00 - Contextual MIPRO AI

### Show

1. Return to `LC-77612` and click **Ask MIPRO AI** at bottom-right.
2. Point to the signed-in role and **Current import case** context.
3. Ask **Explain the current shipment stage**.
4. Ask **Which documents are missing?**.
5. Open Employees -> Activity & Performance with Rafiq selected and ask **Summarize Rafiq's activity today**.
6. Ask **Who has overdue follow-ups?** and click the returned Employees source link.
7. Mention that Super Admin can ask for a read-only access explanation, while the assistant can never grant or revoke access.
8. Reopen the assistant on Reports and ask **Summarize this report period**.
9. Narrow the window briefly to show the near-full-screen mobile panel.

### Say

> The assistant is contextual rather than a separate AI module. It receives the current route, record ID and report period, then the API reads only records already allowed for this role.

> It can explain a deterministic allocation or FIFO recommendation, identify missing evidence, prioritize overdue Marketing work, summarize a permitted employee or report period, and link to the permitted source. Employee activity follows self, team or all scope. Access details require access authority, and every answer remains read-only. It cannot calculate official scores, grant a role, change a permission, advance funnel stages, finalize landed cost, dispatch stock, post a collection or bypass any approval.

> These answers are rule-backed mock intelligence behind typed endpoints. A production LangChain or LangGraph service can replace the server implementation later without rebuilding this interface.

---

## 26:00-27:00 - Settings And Open Decisions

### Show

1. Open **Settings**.
2. Show **Client Confirmation Queue**.
3. Point to a confirmed answer with source/value and a pending decision with disabled behavior.
4. Open **Products & Aliases** and explain approved product variants plus legacy spreadsheet name mapping.
5. In **Business Setup**, show accounts, warehouse, expense categories, cost presets, print configuration and Marketing Score Rules.
6. Open **Data Migration** and show Opening Batch plus Customer Balance forms.
7. Open **Website Content**. Show Overview, Public Products, and Inquiries.
8. Mark an inquiry Qualified, click **Convert to Lead**, assign a Sales Executive and product, then open the linked lead in Marketing.
9. Point out that employee profiles and access do not belong here anymore; they have the direct Employees home already demonstrated.

### Say

> Settings is now focused on business and system configuration: products, suppliers, accounts, warehouse, expense categories, import presets, printing, migration, website content and explicit client decisions. Employee access is no longer something a manager must discover inside Settings.

> Score weights are configurable, but points come only from real qualified leads, verified visits, quotations, orders, collections, and completed follow-ups. Manual notes cannot manufacture transaction points.

> Confirmed decisions retain the actual answer, notes, source, user and time. Local transport CBM and FIFO are confirmed. Invoice requirement, common-cost default, accounting depth, warehouse count, sales tax and finalization authority remain visible rather than silently hard-coded.

> Website Products and ERP Products are two controlled records. Website Content publishes approved image and descriptive information. Products & Aliases holds internal codes, prices, stock and costing relationships. The first owner is provisioned securely during backend deployment; that owner creates employees in Employees, so there is no public Super Admin registration page and no routine manual database editing.

---

## 27:00-29:20 - Prove Effective Access

### Show

1. Sign out and sign in as `import@mipro.local` with `password123`.
2. Show that Reports appears because of a personal Allow, while confidential landed-cost details still require a separate capability.
3. Sign out and sign in as `salesmanager@mipro.local`.
4. Open Employees. Show Directory, Field Team and Activity & Performance, but confirm **Access & Roles is hidden**. Create a Sales Executive or edit a lower-role employee's territory/status.
5. Confirm Settings is absent solely because employee management was delegated. Open Reports and point out that Export is absent because this user's explicit Deny wins over the Sales Manager role default.
6. Sign out and sign in as `sales1@mipro.local`.
7. Open **Sales & Marketing -> Marketing** and point to My Marketing Day, own plan, own follow-ups, own leads, and own performance. Confirm no team employee selector appears.
8. Click **Check In / Out**. Show My Field Day, the active session, today's visits, and location timestamp.
9. Allow browser location, then complete the checked-in visit with products, outcome, next follow-up, remarks, and optional evidence. Return to Marketing and show the Check Out event and updated plan/follow-up.
10. Type `/app/employees` and show Access denied. Open Reports and prove the Sales Executive receives only self; try another employee ID directly and show denial.
11. Ask Field Team AI about another salesperson and show the refusal.
12. Ask MIPRO AI `What is the landed cost and profit margin?`; pause on the permission-safe refusal.
13. Type `/app/accounts` in the address bar and show **Access denied**.

### Say

> This is not a cosmetic role switch. The same effective-access resolver controls navigation, direct routes, buttons, APIs, documents, reports and AI context. Import Officer plus Reports and Sales Manager plus employee administration are user-specific exceptions, not new roles.

> Delegating employee maintenance does not delegate access administration. The manager can create a Sales Executive and update lower-role employment data, but attempts to assign Accounts, edit a Super Admin or change permissions are rejected by the API.

> Even a direct URL and an AI question are denied at the API boundary. Customers, transactions and employee reports are owner-filtered, and sensitive cost fields are never sent.

---

## 29:20-30:00 - Closing

### Say

> This release completes the latest audited frontend scope: PO-first imports, protected evidence, finalized landed cost, receiving and FIFO stock, daily Sales & Marketing, leads and follow-ups, Employees directory/login/access/activity/Field Team, quotation through collection, structured operational expenses, practical reporting, contextual role-safe assistance, business settings and supplied-stationery print views.

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
- [ ] Import Officer's personal Reports Allow is demonstrated.
- [ ] Sales Manager's Employee lifecycle delegation and Reports Export Deny are demonstrated.
- [ ] Settings shows only tabs allowed to the current user.
- [ ] Employee management is explained separately from access management.
- [ ] Eight possible Super Admin destinations and role-hidden navigation are explained.
- [ ] Employees Directory, profile image, employment fields and Login Account are shown.
- [ ] Access & Roles shows role defaults, Allow, Deny and sensitive capabilities only to Super Admin.
- [ ] Sales Manager Employees hides Access & Roles, and employee access alone does not expose Settings.
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
- [ ] Sales & Marketing opens the daily Marketing hub in one click and polls every 12 seconds.
- [ ] Manual activity and automatic quotation/order/delivery/collection events are distinguished.
- [ ] Real new transaction time and legacy Time unavailable behavior are explained.
- [ ] Lead -> Customer -> Quotation preserves one connected reference.
- [ ] Follow-up Today/Overdue, stage-filtered funnel, Needs Attention, monthly plan, target, and score are shown.
- [ ] Employee Activity & Performance cross-links to focused Field Team and preselected Reports.
- [ ] Sales Executive My Field Day and fresh-GPS check-out are demonstrated.
- [ ] Qualified website inquiry is explicitly assigned and converted to a lead.
- [ ] Expense For, directory employee attribution, and signed-in Entered By are shown.
- [ ] Operating expenses remain separate from landed cost.
- [ ] Marketing presets, More Filters, searchable customer/lead, grouping, CSV and TA/DA sheet are shown.
- [ ] All-employee comparison, individual employee details and employee print are shown.
- [ ] Contextual AI uses current import, employee and report context and provides source links.
- [ ] Marketing AI explains deterministic attention items without controlling official metrics.
- [ ] Sales Executive AI cost refusal and own-only report are demonstrated.
- [ ] MIPRO digital, preprinted and Order Receiving Sheet views are shown.
- [ ] Settings confirmation queue is shown.
- [ ] Marketing permission and configurable score rules are shown.
- [ ] Opening stock/customer balance migration and product aliases are shown.
- [ ] Sales Executive access denial is demonstrated.
- [ ] Temporary mock persistence is stated honestly.
- [ ] Backend-ready API boundary is explained in plain language.
