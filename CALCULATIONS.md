# MIPRO ERP Calculation Reference

All money and quantity calculations use decimal values, not binary floating-point arithmetic. API amounts are decimal strings; BDT totals are rounded to two decimal places only at the final monetary step.

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
| Product-specific | 100% to the selected product(s) |
| Manual split | user-entered amounts that must equal the cost-row total |

Final allocation uses largest-fractional-remainder rounding: calculate every exact share, round down to poisha, then assign remaining poisha to the largest fractions with stable item-ID tie-breaking. This guarantees allocated totals equal the source cost exactly.

Customs duty is not calculated by the ERP. The user enters the final assessed amount per product, and that amount is included as a product-specific landed cost.

## Inventory And FIFO

```text
Available batch quantity = Received quantity - Dispatched quantity
Delivery COGS = Dispatched quantity * actual selected batch landed cost/unit
```

Automatic dispatch uses the oldest eligible non-expired matching batch first. If one batch is insufficient, it continues into the next oldest batch. A newer-batch override requires authority and a reason.

## Sales, Invoice And Due

```text
Line gross    = Quantity * Unit price
Line total    = Line gross - Line discount
Invoice total = Sum of line totals
Customer due  = Opening due + approved invoices - posted collections - approved reversals
```

A Delivery Challan reduces stock but does not create customer due. A Draft Invoice changes no balance. Invoice approval posts the receivable once; collection then reduces customer/order due and increases the selected cash, bank or mobile-banking account.

## Expenses And Account Reports

```text
TA/DA expense = TA amount + DA amount
Account balance after cash in  = Previous balance + amount
Account balance after cash out = Previous balance - amount
Operating expense total = Sum of posted, non-reversed operating expenses
```

Advance and Company Loan movements appear separately from operating expenses. The Monthly A/C Summary combines posted collections and operating costs, then reports Advance and Company Loan cash movements in a non-operating section.

## Profit And Period Reports

```text
Delivered gross profit = Delivered line value - actual dispatched-batch COGS
Period invoiced sales   = Approved invoice totals dated inside the selected period
Period collections      = Posted collection totals dated inside the selected period
```

Financial sales reports use approved invoices. Operational delivery reports use Delivery Challans. They are intentionally separate so one delivery and its invoice are never counted as two financial sales.

## Update 9 Operational Reports

```text
Order remaining quantity = Ordered quantity - Delivered quantity
PO receipt outstanding    = Expected quantity - Received quantity - Rejected quantity
Account net movement      = Period inflow - Period outflow
```

Product-family reports group canonical products by their master-data category. Stock Summary totals available quantities from batches; it does not infer stock from invoices. Day Book and channel reports use posted account transactions, while Customer Dues uses the customer ledger balance. The same period and catalogue filters are applied to the screen table, CSV export and A4 preview.

## Print Calibration

The print sheet is fixed at `210 x 297 mm` (A4), with zero CSS page margin. Digital letterhead artwork uses `1.5 mm` bleed on each edge, and the content safe area is shifted left by `1.5 mm` (`24 mm` to `22.5 mm`). Browser printing must use A4, no margins, 100% scale, background graphics enabled, and browser headers/footers disabled.
