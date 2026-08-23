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

## Recommended 12-Minute Demo

1. **Landing:** explain import -> stock -> sale.
2. **Dashboard:** show six KPIs and actionable lists.
3. **Imports:** open `LC-77612`.
4. **Commercial & Products:** show one LC with three variants.
5. **Costs & Allocation:** show different rules and Add Cost.
6. **Landed-Cost Result:** click Preview and expand an explanation.
7. **Warehouse Receipt:** explain finalization lock and inherited cost.
8. **Inventory:** show product images, Batches, Movements, FIFO and expiry.
9. **Sales:** show customer ledger, quote/order, delivery and collection.
10. **Expenses & Accounts:** show expense isolation and account ledger.
11. **Reports:** show grouped values, chart and audit.
12. **Settings:** show capabilities and confirmation queue.

End by signing in as Sales Executive to show the minimal own-record view and direct-URL denial.

## Acceptance Checklist

### Import

- [ ] One import case contains multiple products.
- [ ] Draft reference changes to LC/TT as the visible reference.
- [ ] Product lines can be added, edited and removed before finalization.
- [ ] Cost rows can be added, edited and removed with explicit allocation.
- [ ] CBM, FOB value, quantity, product-specific and manual allocation are available.
- [ ] Preview totals reconcile exactly.
- [ ] Each allocation has an explanation.
- [ ] Finalized snapshot is immutable.
- [ ] Reopen requires capability and reason.
- [ ] Receipt is locked before finalization.
- [ ] Partial receipt and final receipt create stock.

### Inventory

- [ ] Stock shows images, canonical code and available quantity.
- [ ] Batches show lot, expiry, receipt date and location.
- [ ] Movements show stock in/out references.
- [ ] Oldest eligible batch is recommended.
- [ ] Newer-batch selection creates a warning.
- [ ] Authorized override requires a reason.

### Sales

- [ ] Customer CRUD works for permitted roles.
- [ ] Quotation lines carry into order.
- [ ] Digital and preprinted quotation views render.
- [ ] Delivery selects an actual batch and reduces stock.
- [ ] Delivery creates customer due.
- [ ] Collection supports cash, mobile banking, bank transfer and cheque.
- [ ] Collection reduces due and updates an account.

### Expenses, reports and security

- [ ] General expense and TA/DA can be posted.
- [ ] Reversal requires a reason.
- [ ] Expense does not change landed cost.
- [ ] Reports reflect operational records.
- [ ] Settings are Super Admin-only.
- [ ] Roles show only their permitted navigation.
- [ ] Unauthorized direct URLs show Access denied.
- [ ] Sensitive cost is absent for unauthorized roles.

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

Run `test:flows` and `smoke` while the development server is active. Restart the API afterward to restore seed data for a client presentation.

## Honest Demo Language

Say:

> This is a complete functional frontend and workflow prototype. Every screen uses typed API services, so the persistent backend can replace the mock without changing the user flow.

Also say:

> Demo changes are temporary because the current API is in-memory. Database, durable file storage and real authentication are the next production phase.

Do not claim that AI, GPS, HR/payroll, fleet, invoice, full accounting, automatic customs calculation or persistent storage are active features.

