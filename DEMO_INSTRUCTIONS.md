# MIPRO ERP Demo Instructions

## Fast Start

```powershell
npm install
npm run dev
```

Open the frontend URL printed by Vite. Sign in as:

```text
superadmin@mipro.local
password123
```

## Recommended 15-Minute Demo

1. **Landing:** explain import -> stock -> sale.
2. **Dashboard:** show six KPIs and actionable lists.
3. **Imports:** open New Import to show PO-first draft requirements, then open `LC-77612`.
4. **Commercial & Products:** show one LC with three variants.
5. **Documents:** open the PI PDF, show the protected viewer, then open Extract Fields and emphasize review before apply.
6. **Costs & Allocation:** show different rules, Add Cost, and the protected freight attachment.
7. **Landed-Cost Result:** click Preview and expand an explanation.
8. **Warehouse Receipt:** explain finalization lock and inherited cost.
9. **Inventory:** show product images, Opening/Import batches, smart FIFO/expiry alert, Movements and split FIFO.
10. **Sales:** show running customer ledger, owner profit preview, quote/order, delivery, collection and follow-up recommendations.
11. **Expenses & Accounts:** show expense isolation, account ledger and the utility-receipt image viewer.
12. **Reports:** set From/To, open Salesperson Performance, compare all employees, select one employee, print, then show TA/DA/audit.
13. **MIPRO AI:** ask about the open import, then show a Sales Executive receiving a permission-safe cost refusal.
14. **Settings:** show capabilities, Role Access Summary, aliases, opening-data migration, print calibration and confirmation answers.

End as Sales Executive to show own-record Sales and Reports, direct-URL denial, and no cost/profit leakage.

## Acceptance Checklist

### Import

- [ ] Draft can start from supplier + PO + products before PI/LC.
- [ ] One import case contains multiple products.
- [ ] Draft reference changes to LC/TT as the visible reference.
- [ ] Status is action-derived; cancel/close are controlled and terminal records are read-only.
- [ ] FOB/CBM basis values are recomputed by the API.
- [ ] Product lines can be added, edited and removed before finalization.
- [ ] Cost rows can be added, edited and removed with explicit allocation.
- [ ] CBM, FOB value, quantity, product-specific and manual allocation are available.
- [ ] Preview totals reconcile exactly.
- [ ] Each allocation has an explanation.
- [ ] Finalized snapshot is immutable.
- [ ] Reopen requires capability and reason.
- [ ] Reopen is blocked after any warehouse receipt.
- [ ] Receipt is locked before finalization.
- [ ] Partial receipt and final receipt create stock.

### Inventory

- [ ] Opening/legacy batches can be posted through Settings.
- [ ] Stock shows images, canonical code and available quantity.
- [ ] Batches show lot, expiry, receipt date and location.
- [ ] Movements show stock in/out references.
- [ ] Oldest eligible batch is recommended.
- [ ] One quantity can split across several FIFO batches.
- [ ] Expired batches are excluded from dispatch.
- [ ] Newer-batch selection creates a warning.
- [ ] Authorized override requires a reason.

### Sales

- [ ] Customer CRUD works for permitted roles.
- [ ] Customer detail shows opening balance and running ledger.
- [ ] Legacy product aliases map to canonical products.
- [ ] Owner-only price preview shows FIFO COGS and profit/loss.
- [ ] Quotation lines carry into order.
- [ ] Actual MIPRO/LED digital and calibrated preprinted quotation views render.
- [ ] Order Receiving Sheet uses the supplied structure.
- [ ] Delivery selects an actual batch and reduces stock.
- [ ] Delivery creates customer due.
- [ ] Collection supports cash, mobile banking, bank transfer and cheque.
- [ ] Credit is not a collection; valid active account and non-cash reference are required.
- [ ] Collection reduces due and updates an account.

### Expenses, reports and security

- [ ] General expense and TA/DA can be posted.
- [ ] Reversal requires a reason.
- [ ] Expense does not change landed cost.
- [ ] Reports reflect operational records.
- [ ] Report From/To changes data and CSV contains actual rows.
- [ ] Salesperson Performance compares all employees and prints one selected employee.
- [ ] Sales Executive can open only their own performance report.
- [ ] TA/DA Approved Sheet and owner realized-profit report render.
- [ ] Settings are Super Admin-only.
- [ ] Roles show only their permitted navigation.
- [ ] Unauthorized direct URLs show Access denied.
- [ ] Sensitive cost is absent for unauthorized roles.

### Documents and contextual AI

- [ ] Import PDF and expense image open in the shared viewer.
- [ ] Freight/customs attachments return 403 without sensitive-cost permission.
- [ ] Missing file metadata produces a clear preview error.
- [ ] Extract Fields opens a review panel with nothing selected by default.
- [ ] MIPRO AI shows the current role and workspace context on desktop and mobile.
- [ ] Inventory recommendations agree with deterministic FIFO/expiry data.
- [ ] Sales follow-up recommendations link to the relevant workspace.
- [ ] Sales Executive AI refuses landed-cost/profit requests and does not reveal values.

## Reset Demo Data

The API stores data in memory. Restart `npm run dev` to restore the normalized seed locally. A Vercel redeployment or serverless cold start may also reset it.

## Health Checks

Local:

```text
http://localhost:5173/api/health
```

Deployed:

```text
https://YOUR-PROJECT.vercel.app/api/health
```

Expected service name:

```text
mipro-simplified-erp-api
```

## Automated Verification

```powershell
npm run lint
npm test
npm run typecheck:api
npm run test:flows
npm run build
npm run smoke
```

`test:flows` starts its own isolated API. Run `smoke` while the development server is active, then restart the demo API to restore seed data before presenting.

## Honest Demo Language

Say:

> This is a complete functional frontend and workflow prototype. Every screen uses typed API services, so the persistent backend can replace the mock without changing the user flow.

Also say:

> Demo changes are temporary because the current API is in-memory. Database, durable file storage and real authentication are the next production phase.

The floating AI and extraction are active **rule-backed mock capabilities** behind typed endpoints. Do not present them as a production language model, autonomous approver, or durable document-intelligence service.

Do not claim that GPS, mobile visits, HR/payroll, fleet, invoice, full accounting, automatic customs calculation or persistent storage are active features.
