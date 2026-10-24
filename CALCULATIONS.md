# MIPRO ERP Calculation Reference

The persistent backend uses `decimal.js` for import costing, receipt/dispatch valuation, sales, invoices, collections and operating finance. SQL reports use PostgreSQL `numeric`. API amounts are decimal strings; BDT monetary totals round half-up to two decimals.

## Import And Landed Cost

```text
FOB value in BDT = Quantity * FOB/unit * captured exchange rate
Cost line in BDT  = Foreign amount * captured exchange rate
Final landed total = Product FOB value in BDT + all allocated import costs
Landed cost/unit   = Final landed total / imported quantity
```

Each cost row is allocated by one selected basis:

| Method | Item share |
|---|---|
| CBM | item CBM / total eligible CBM |
| FOB value | item FOB value / total eligible FOB value |
| Quantity | item quantity / total eligible quantity |
| Product-specific | 100% to exactly one selected import item |
| Manual split | user-entered amounts that must equal the cost-row total |

Final allocation uses largest-fractional-remainder rounding: calculate every exact share, round down to poisha, then assign remaining poisha to the largest fractions with stable item-ID tie-breaking. This guarantees allocated totals equal the source cost exactly.

Both FOB/item and converted cost rows are rounded to BDT two decimals before allocating. Manual splits must reconcile to that rounded cost-row amount. CBM is either `cartons * CBM/carton` (8 decimals) or the explicitly entered total. Quantity allocation uses units, not volume; FOB allocation uses BDT value. Each cost row chooses its own basis.

The screen displays unit cost at 2 decimals; finalized snapshots also retain a 10-decimal unit rate. Partial receipts use `round(final item total * cumulative accepted quantity / imported quantity, 2) - previously received value`. Example: BDT 100 over 3 units receives as 33.33, 33.34, 33.33, not 99.99. Stock valuation sums these saved batch values. Rejected units create no stock; their proportional value remains outside inventory pending a later loss/claim workflow.

Customs duty is not calculated by the ERP. The user enters the final assessed amount per product, and that amount is included as a product-specific landed cost.

## Inventory And FIFO

```text
Available batch quantity = Received quantity - Dispatched quantity
Delivery COGS = round(batch received value * cumulative dispatched quantity / batch received quantity, 2)
                - previously posted COGS for that batch
```

Automatic dispatch uses the oldest eligible non-expired matching batch first. If one batch is insufficient, it continues into the next oldest batch. A newer-batch override requires authority and an audited reason. Transactional dispatch now persists these quantities and exact COGS together. It never multiplies a rounded display unit cost: BDT 100 over three units dispatches as 33.33, 33.34 and 33.33. Product/batch locks prevent two API workers from overselling.

## Sales, Invoice And Due

```text
Line gross    = round(Quantity * Unit price, 2)
Line total    = Line gross - Line discount
Invoice total = Sum of line totals
Customer due  = Sum(customer journal debits - credits)
             = Opening due + approved invoices - collections + receipt reversals - invoice cancellations
```

Persistent quotes use quantities with four decimals, unit prices/absolute discounts with two decimals, and sum the rounded line amounts. The discount is a BDT amount, not a percentage. Values use a dedicated 48-digit Decimal context; numbers beyond the database precision are rejected. Product identity/name comes from the master, and submitted line/document totals are ignored. Quote-to-order conversion copies those saved lines and snapshots exactly, without posting stock, cash or due. Customer/order balances are derived from journal debits minus credits, not editable totals.

A Delivery Challan reduces stock but does not create customer due. A Draft Invoice changes no balance. Invoice approval posts the receivable once; collection then reduces customer/order due and increases the selected cash, bank or mobile-banking account.

## Order Lifecycle (Update 11)

The server uses Decimal to group quantities by product. Money is returned with two decimal places and quantities with four.

```text
Delivered = Sum of posted challan quantities for the order/product
Remaining to deliver = max(0, ordered quantity - delivered quantity)
Approved invoiced = Sum of approved invoice quantities for the order/product
Delivered not invoiced = max(0, delivered quantity - approved invoiced quantity)
Delivered value = Sum of posted challan line totals after discount
Approved invoice value = Sum of approved invoice totals for the order
Collected = Sum of posted receipts linked to the order OR its invoices, counted once
Outstanding = max(0, approved invoice value - collected)
Invoice payment ceiling = Invoice receivable - active receipt allocations to that receivable
```

Draft invoices reserve challans against duplicate invoicing but create no due; their quantities appear separately as pending approval. Cancelled invoices and reversed receipts do not count. An invoice-only payment resolves its order. Customer-level receipts allocate to eligible outstanding receivables oldest date first, with stable entry-ID tie-breaking; only the allocation to a particular order counts there. Example: a BDT 1,000 receipt allocated 250.01/749.99 contributes 250.01 to the first order, not 1,000. Overpayment is rejected.

Partial delivery revenue and discount use the same cumulative-share formula as COGS, based on the saved order-line totals. Invoices copy complete saved challan lines. Receipt reversal appends equal customer debit and bank outflow, preserving the original receipt and journals; invoice cancellation appends a credit after its receipts are reversed. Cash/bank balances sum immutable inflows minus outflows. Server and database guards require exact reconciliation and nonnegative stock/cash balances.

## Expenses And Account Reports

```text
TA/DA expense = TA amount + DA amount
Account balance after cash in  = Previous balance + amount
Account balance after cash out = Previous balance - amount
Operating expense total = Sum of posted, non-reversed operating expenses
Supplier net balance = Posted obligations - posted payments
Supplier payable = max(0, net balance)
Supplier advance = max(0, -net balance)
```

TA/DA totals are derived by the server, ignoring a submitted total. Employee/category names are captured from their masters at posting, and Entered By comes from the authenticated user. General expenses use their entered positive amount. Expense posting creates an equal cash/bank outflow atomically; reversal creates an equal inflow. Neither changes import landed cost.

Supplier obligations record debt but move no cash. Payments create equal account outflows; reversing a payment restores cash. Payments exceeding obligations remain a supplier advance, not a negative payable hidden from the user. Financial-position entries are verified opening/adjustment sources only and do not change cash automatically.

Account balances sum immutable inflows minus outflows, including compensating reversals; they are not editable totals. Concurrent expense/payment requests lock the same account, so they cannot spend the same balance twice. Current cash entries must be chronological; historical/backdated posting and opening reconciliation remain launch items.

Advance and Company Loan movements remain separate from operating expenses. The persistent Monthly A/C Summary groups the saved cash journal by source, with non-operating movements separate. It is a cash movement report, not a profit-and-loss statement.

## Profit And Period Reports

```text
Delivered gross profit = Delivered line value - actual dispatched-batch COGS
Period invoiced sales   = Approved invoice postings - cancellations dated in the period
Period collections      = Receipt allocations - receipt reversals dated in the period
```

Financial sales reports use approved invoices. Operational delivery reports use Delivery Challans. They are intentionally separate so one delivery and its invoice are never counted as two financial sales.

## Update 9 Operational Reports

```text
Order remaining quantity = Ordered quantity - Delivered quantity
PO receipt outstanding    = Expected quantity - Received quantity - Rejected quantity
Account net movement      = Period inflow - Period outflow
```

Product-family reports group canonical products by their master-data category. Stock Summary totals available quantities from batches; it does not infer stock from invoices. Day Book and channel reports use posted account transactions, while Customer Dues uses the customer ledger balance. The same period and catalogue filters are applied to the screen table, CSV export and A4 preview.

## Persistent Report Dates And Totals

- PostgreSQL `numeric` performs report arithmetic; API values remain decimal strings. The browser only formats explicit money/quantity columns, never regroups financial data with `Number`.
- An invoice dated yesterday remains yesterday's sale after cancellation today. Today shows its negative reversal. Receipt, expense and supplier reversals follow the same business-date rule. Current workspace totals above describe current status; historical reports use dated events.
- Customer opening due is `sum(debit - credit)` before From; closing due includes all entries through To. Running statements carry earlier amounts into an explicit opening row. Mixed-order receipts count each actual allocation once.
- Cash opening/closing use `sum(inflow - outflow)` before From/through To. Period flows exclude earlier entries. Non-operating advances and loans are not sales or operating expenses.
- Physical stock/value at To are received quantity/value less dispatched quantity/value through To. Invoice cancellation does not restore stock. Received value and COGS use saved rounded postings, not display unit price multiplication.
- Expiry attention uses the report end date: expired, then 31/92/183-day bands, matching the existing Inventory screen's approximate one/three/six-month alerts. Expired stock remains physically on hand but cannot be dispatched.
- Sales Summary groups by calendar day, Monday-start week, month or year. Distinct customers are counted within the whole group, not added from daily counts. Gross Profit by Product uses invoiced saved delivery cost and reverses that margin on cancellation.
- Master names/assignments/status are current. Import registers use current commercial records filtered by PO date; finalized-cost reports use the current immutable snapshot's finalization date. These are not reconstructed historical master/commercial records.
- Screen totals cover every filtered row, not just the current page. Running balances, unit rates and document-register values are not summed as revenue. Print/CSV regenerate using the same authorized period, grouping and stable record IDs; later postings can change a later regeneration.
- Reports never manufacture opening balances or a balancing equity figure. Balance Sheet remains pending approved opening/reconciliation data. Saved field check-ins are evidence-assisted records, not GPS proof.

## Employee Performance

- Submitted activities: count authenticated manual submissions in the occurred-date period, excluding drafts and activities voided through the end date. Self-reported visits are not GPS-verified visits.
- Net sales: approved invoice journal debits minus cancellation credits, attributed to the invoice owner. Quotations, orders and deliveries do not add financial sales.
- Collections: actual receipt allocations minus dated reversals, attributed to each invoice owner (receipt owner for unallocated entries). A shared receipt is not duplicated across employees.
- Score: `sum(eligible event count * current active rule points)`. Defaults: qualified lead 10, actual lead-to-customer conversion 5, submitted quotation 15, order 30, posted receipt 20, completed follow-up 5. Receipt reversal subtracts its 20-point credit on its reversal date. Receipt score belongs once to its saved owner, independently of financial allocation. Unverified visits score zero.
- Targets: sum configured monthly targets for months intersecting the period, without prorating. Progress is `actual / target * 100`, rounded to two decimals; absent/zero targets display `Not set`.
- Plans are commitments, not actual performance. Lead funnel shows current derived commercial stages for leads created through To, not a reconstructed historical funnel. Weights and master assignments are current; manual activity name/ID snapshots remain unchanged after profile edits.

## Field Check-ins (Update 12)

- **Location age:** server receipt time minus the browser's claimed capture time. More than the saved policy limit (default 30 seconds), or over five seconds in the future, is `STALE`. Accuracy above the saved limit (default 100 m) is `POOR_ACCURACY`. Missing location requires a reason. Browser values can be spoofed; none proves attendance.
- **Site distance:** Haversine great-circle distance, using mean Earth radius `6,371,008.8 m`, rounded to two decimals. Compare only with an independently approved, versioned customer site.
- **Advisory match:** with fresh/acceptable accuracy, `distance + accuracy <= radius` means approximate match; `distance - accuracy > radius` means outside; overlapping uncertainty means uncertain. Default radius is 150 m. Without a reference, display `NO_REFERENCE`; poor/stale evidence with a reference remains uncertain.
- **Counts:** recorded check-ins exclude currently voided visits in the server-receipt period. Manager-accepted count is their current accepted subset. Visit-record total = check-ins + submitted same-period visit notes not explicitly linked to a non-void check-in. A link must identify the same author/contact/business date. Unlinked records are not assumed to be duplicates. These counts are not attendance totals or historical review snapshots.
- **Points and money:** every check-in awards **zero visit points**, regardless of score-rule settings or manager acceptance. Imports, stock, invoices, collections and accounts remain unchanged. Completing a visit may create one follow-up atomically; completing that follow-up later remains its own existing scored event.
- **Photo size:** Canvas scales the longest edge to at most 960 px (smaller if needed), adaptively encodes to at most `300 * 1024` bytes, and strips original metadata. The server decodes actual pixels, enforces 16-1920 px per side/no animation and stores a SHA-256 of the accepted bytes. Photos stay in private Storage, not database/base64 payloads.

## Persistent Dashboard

- Net sales/collections and invoiced gross profit reuse the report SQL facts above, including reversals on their own dates. Gross profit excludes operating expenses; the same stock dispatch is not counted again as an invoice cost.
- Receivables = sum of positive per-customer `debit - credit` balances through To. Customer credit balances are not netted against another customer's due; Reports retains those credits separately.
- Cash/bank = sum of posted `In - Out` through To, including compensating entries. Missing openings are not estimated.
- Current stock KPI counts distinct products with positive batch stock, not a sum of mixed units. Expiry attention counts remaining batches expiring within 92 days, including already expired ones. Active imports exclude Received, Closed and Cancelled.
- Follow-up queues show current pending items due today or earlier. Check-ins use the selected server-receipt dates and current non-void status. Employee/team scope and financial permissions are applied before data leaves the server.
- Values remain PostgreSQL numeric/decimal strings. Only chart coordinates use JavaScript numbers; displayed totals/tooltips retain the original exact strings. Work lists show at most eight rows alongside the full matching count.

Warehouse settings and cost presets calculate no balances or prices. A preset never chooses an allocation method automatically. Client-decision confirmation records an agreement, not an automatic financial posting or permission grant.

## Print Calibration

The print sheet is fixed at `210 x 297 mm` (A4), with zero CSS page margin. Digital letterhead artwork uses `1.5 mm` bleed on each edge, and the content safe area is shifted left by `1.5 mm` (`24 mm` to `22.5 mm`). Browser printing must use A4, no margins, 100% scale, background graphics enabled, and browser headers/footers disabled.

Persistent transaction previews display saved monetary totals to two decimals and quantities to four (trailing quantity zeroes omitted). Order subtotal is `sum(saved line total + saved line discount)`; discount is `sum(saved line discount)`. Printing never recalculates the posted amount from a rounded unit cost. Report page edges remain 1.5 mm left/0.2 mm right, with an additional internal 27 mm left branding-safe zone. Printer-driver margins cannot be overridden by these CSS calculations.
