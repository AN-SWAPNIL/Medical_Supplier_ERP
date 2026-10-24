# Production Backend Progress

Updated: 24 October 2026. Target: the complete existing ERP, not just authentication.

## Verified Foundation

- [x] Hosted PostgreSQL, Drizzle migrations, verified TLS and backups before changes.
- [x] Supabase Auth, persisted employee access, revocable sessions, password recovery and private uploads.
- [x] Products/suppliers, imports/items/costs, precise allocation, immutable snapshots and partial receiving.
- [x] Persisted batches/movements, FIFO preview, receipt concurrency and retry protection.
- [x] Session-specific frontend query caches; production cannot implicitly fall back to mock authentication.
- [x] Duplicate LC references rejected by the database. Existing duplicates are never silently removed.
- [x] Customer/quotation/order persistence, canonical lines, current-version edits and concurrent/idempotent conversion tested through real APIs.
- [x] Sales frontend and derived order workspace connected to persistent deliveries, invoice approvals/cancellations and allocated collections/reversals.
- [x] Atomic FIFO dispatch, exact saved batch COGS, authorized overrides and cross-customer/cross-instance oversell protection.
- [x] Cash/bank master data, immutable account journals and customer receivables reconcile to the same posting transaction.
- [x] Operating expenses/TA-DA, versioned categories, canonical employee attribution and private expense evidence persist.
- [x] Supplier obligations/payments/advances and restricted financial-position sources persist with audited reversals.
- [x] Accounts frontend, cross-module cash concurrency and exact compensating voucher/expense/payment reversals verified.
- [x] Company stationery persists with optimistic versions/audits; Sales/Accounts/import-cost print actions load source-authorized saved records.
- [x] Seven saved document types verified at desktop/390px in both letterhead modes. A 40-line layout stress case produces three A4 pages, repeats column headings, retains all 40 rows once and preserves the final total.
- [x] 60 authorized SQL report read models across imports, inventory, sales, customer/supplier journals, expenses/cash-bank, employee/marketing, roster and narrow controls. Report-specific filters, exact decimal-string totals, pagination, bounded server CSV and letterhead output use the same source queries.
- [x] Historical sales/receipt/expense/supplier reversals remain on their own business dates; stock/value is reconstructed through the end date. Hosted reconciliation verifies saved COGS, opening/running balances, own-record scope and warehouse financial redaction across API instances.
- [x] Reports catalogue/settings/CSV/both letterhead modes verified at 1440px and 390px. A 100-row layout-only report verifies continuation headings and A4 pagination. Inventory and Reports share expiry-band boundaries; family sales retain product units.
- [x] Persisted reporting hierarchy, scoped safe employee profiles, private photos, verified invitation/access controls and affected-session revocation.
- [x] Authenticated own activities/private evidence, canonical leads/customer conversion, follow-ups/successors, daily/monthly plans/independent reviews, targets and versioned score rules. Database guards retain submitted/approved history.
- [x] SQL employee timelines/performance/targets use the same saved commercial records and dated journals; manual notes cannot fabricate money, scored transactions or GPS visits.
- [x] Workforce desktop/390px real-login walkthrough: directory search, profile/access screens, team views, own activity/follow-up posting, direct-URL denial and both report letterhead modes. Activity details are grouped into six readable screen/A4 columns; CSV retains the detailed source fields.

Foundation mode never falls through to the old mock API. A missing persistent workflow returns an explicit unavailable response. `/backend` is the temporary migration workspace, not evidence that the entire `/app` ERP is migrated.

Local regression checks: 75 tests pass (nine hosted suites skipped by default). Hosted sales tests cover separate API workers, partial rounding, duplicate invoices, approval replay, allocated receipts, overpayment races, reversals and financial redaction. Finance tests cover expense/payment competition for the same cash, private receipts, snapshot isolation, source validation and journal tamper rejection. Report checks exercise every available SQL query/filter, grouped sales, dated reversals, as-of stock/customer/supplier/cash position and source/print/export denial. Desktop/390px Sales and Accounts walkthroughs pass, including read-only MD access and Sales Executive direct-URL denial. Import/master/inventory browser regressions also passed. The last read-only service check had zero failures and one warning about a plaintext password comment in the ignored local `.env`.

## Remaining Implementation

- [ ] Verified opening receivables/data migration; customer CRUD already persists assignments and contact details.
- [ ] Approved opening balances and historical/backdated finance entry policy. Current cash posting enforces chronological dates and sufficient funds; financial-position sources are not a full general ledger.
- [ ] Opening stock, returns, stock adjustments and the approved rejected-goods loss/claim treatment.
- [ ] GPS/field visit verification and its document/workflow permissions. Employee/team scope, daily marketing, leads, plans, follow-ups, targets and private marketing evidence already persist.
- [ ] Durable warehouse/cost-preset/business-decision settings. Expense categories and company stationery already persist; posted-name snapshots are retained.
- [ ] Published public website/catalog/news/certificates, controlled media uploads and public inquiries. Currently public content endpoints require authentication in foundation mode; fix before public cutover.
- [ ] SQL-backed executive dashboard and approved Balance Sheet/opening reconciliation. The 60 supported operational/employee SQL reports, CSV and letterhead previews are connected; pending-source reports are explicitly unavailable, not populated from fixtures.
- [ ] Connect the final existing ERP navigation to these persistent services; no mock fixtures in production screens.
- [ ] MFA enrollment/challenge and privileged enforcement; invitation delivery retry/outbox, orphan upload cleanup and monitoring.
- [ ] Least-privilege runtime DB role, bounded/paginated queries, production security headers and CI/release checks.

## Launch Acceptance

- [x] Independent API-instance persistence, stock/money concurrency and idempotent retry tests for imports, sales and operating finance.
- [ ] Deployed staging/redeploy acceptance for all domains, not just local API instances.
- [ ] Every role tested for routes, actions, own/team records, sensitive fields and private files.
- [ ] All report/print/CSV totals reconcile with posted transactions, including reversals.
- [ ] Database **and file** restore drill, operational alerting, staging acceptance and rollback rehearsed.
- [ ] Identify/export the authoritative prototype records before cutover. Fixtures cannot recover lost in-memory edits. Import/reconcile approved data without resetting destination records.

## Account-Holder Actions

Not needed to continue coding against the existing development project:

1. Before email acceptance testing, configure a verified SMTP sender in Supabase and accept your own administrator setup link privately. Do not send passwords or links in chat.
2. Before production, rotate the exposed development credentials, establish company-owned accounts/billing, and create isolated production credentials/project. Do not put production secrets on arbitrary preview branches.
3. Supply the available source export and have the client approve opening stock, customer/supplier balances, cash/bank and rejected-goods treatment.
4. Approve exact production/staging URLs, MFA enrollment, deployment environment values, backup retention and recovery ownership.

No Docker or separate backend repository/host is required for the selected Vercel Express + hosted Supabase architecture. Do not switch the deployed demo to foundation mode until the remaining workflows and launch acceptance are complete.
