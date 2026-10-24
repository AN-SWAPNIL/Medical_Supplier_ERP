# Production Backend Progress

Updated: 25 October 2026. Target: the complete existing ERP, not just authentication.

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
- [x] 61 authorized SQL report read models across imports, inventory, sales, customer/supplier journals, expenses/cash-bank, employee/marketing/field visits, roster and narrow controls. Report-specific filters, exact decimal-string totals, pagination, bounded server CSV and letterhead output use the same source queries.
- [x] Historical sales/receipt/expense/supplier reversals remain on their own business dates; stock/value is reconstructed through the end date. Hosted reconciliation verifies saved COGS, opening/running balances, own-record scope and warehouse financial redaction across API instances.
- [x] Reports catalogue/settings/CSV/both letterhead modes verified at 1440px and 390px. A 100-row layout-only report verifies continuation headings and A4 pagination. Inventory and Reports share expiry-band boundaries; family sales retain product units.
- [x] Persisted reporting hierarchy, scoped safe employee profiles, private photos, verified invitation/access controls and affected-session revocation.
- [x] Authenticated own activities/private evidence, canonical leads/customer conversion, follow-ups/successors, daily/monthly plans/independent reviews, targets and versioned score rules. Database guards retain submitted/approved history.
- [x] SQL employee timelines/performance/targets use the same saved commercial records and dated journals; manual notes cannot fabricate money, scored transactions or GPS visits.
- [x] Workforce desktop/390px real-login walkthrough: directory search, profile/access screens, team views, own activity/follow-up posting, direct-URL denial and both report letterhead modes. Activity details are grouped into six readable screen/A4 columns; CSV retains the detailed source fields.

Foundation mode never falls through to the old mock API. A missing persistent workflow returns an explicit unavailable response. `/backend` is the temporary migration workspace; supported old `/app` deep links now preserve their destination, record ID and filters when redirected. This is not evidence that every historical prototype feature is migrated.

### Update 12 Field Check-in

- [x] Backup-first additive migrations 0019-0022 installed; 50 private tables, including five new RLS-enabled visit/location/policy tables. Existing records preserved.
- [x] Self-only canonical customer/lead check-in, single-use ten-minute capture attempts, fresh location/explicit exceptions, server receipt time and snapshot identity/policy/site.
- [x] Direct private camera/file uploads, bounded client compression, full pixel decode/MIME/dimension/SHA-256 validation, single-use evidence binding and scoped 60-second read links.
- [x] One active visit per employee; author completion/outcome and atomic optional follow-up; versioned independent TEAM/ALL review/void, including MD without Marketing edit. History/evidence retained by database guards.
- [x] My Field Day inside Marketing, shared Employees Team Activity history, customer site confirmation and user-requested timestamped OSM map/accuracy circle. No continuous tracking or inferred travel path.
- [x] Canonical Field Visit Report, same scoped screen/CSV/print sources, employee timeline and separate non-scoring check-in/review counts. Linked manual notes are not counted as another visit; no money/stock changes.
- [x] Hosted tests cover role/team/directory-only privacy, photo replay, API-worker races, completion/review, immutable events/site snapshots, report reconciliation and financial isolation. Desktop/390px browser walkthrough covers camera/file upload, location, map, completion, MD review, search, lost-response exact retry and both letterhead modes.
- [x] Production check-in gated on recorded privacy/retention approval. Bounded abandoned-upload cleanup is dry-run by default and never removes linked evidence.
- [ ] Actual Android Chrome/iPhone Safari HTTPS field UAT; deployed staging/redeploy acceptance; approved employee notice/retention/legal-hold/backup policy and scheduled linked-photo retention.
- [ ] Optional second GPS/photo checkout and stable planned-contact linkage (P1). Visit scoring intentionally remains disabled.

### Dashboard And Operational Settings

- [x] Additive migration 0023 applied backup-first: 53 private ERP tables, including versioned warehouse configuration, cost presets and client decisions. Existing business records preserved; no mock operational records imported.
- [x] `/backend` opens a real role-scoped Dashboard, not a connection-status placeholder. At most six KPIs, a daily sales/collection trend and bounded import, order, dues, expense, expiry, follow-up and visit queues use a repeatable-read SQL snapshot.
- [x] Dashboard sales, allocated collections, saved invoiced COGS, receivables and cash reconcile to the existing report/journal sources. Money stays decimal strings. Period financial values are distinguished from current operational queues; mixed product units are never added into one stock quantity.
- [x] Settings > Operational Settings persists Main Warehouse contact/BIN suggestions, explicit-allocation cost presets and the Super Admin Client Confirmation Queue. Edits require a current version/reason and append before/after audits. Presets deactivate without deleting history; creation is idempotent across API workers.
- [x] Imports consumes active presets without silently selecting an allocation basis. Receiving loads saved BIN suggestions and inherits the canonical read-only Main Warehouse identity. A frontend/API warehouse-name mismatch was corrected; decimal remaining quantities and fractional receipt inputs are preserved.
- [x] Hosted reconciliation, private-table grants, all seven dashboard role payloads, denied source fields, cross-worker stale edits and preset replay verified. Desktop/390px real-login checks cover all seven roles, Settings forms and actual partial warehouse receipts. Test suites use separate physical loopback peers; production login limits are unchanged.
- [x] Client decisions record approval evidence only. They do not automatically enable Balance Sheet, delegated finalization, multi-warehouse, backdating or returns.

### Static Website, Deferred AI And Release Security

- [x] Foundation public pages use published-only bundled brochure content, independently of ERP APIs/authentication. Product/news detail links and supplied literature remain available. Catalogue edits currently require a rebuild; a CMS is explicitly deferred.
- [x] Contact prepares a labelled unsent email/WhatsApp draft. No fabricated inquiry receipt, database inbox or automatic lead conversion is claimed.
- [x] AI is deferred: no active assistant in the persistent workspace, no provider calls or AI secrets. Historical prototype AI remains separate; foundation AI requests fail explicitly rather than reading mock records.
- [x] Real provider-backed TOTP setup/current-password confirmation, code challenge/verification, own-factor management and explained removal. Verified second-factor access is enforced on the API, not just hidden in the UI.
- [x] Production/Vercel requires MFA for Super Admin, MD, Accounts and access managers. An enrolled factor requires verification in development too. Verification replaces the current ERP token and revokes other sessions; the last required verified factor cannot be removed without a verified replacement.
- [x] Safe JSON parser errors, same-origin foundation CORS, managed Vercel proxy trust only, deployment security/no-store headers and credential-free CI/release checks. Private PDF blob previews remain allowed by CSP.
- [x] Hosted real-provider checks verify failed/successful codes, factor ownership, HTTP 428 business denial, worker-independent access, obsolete token rejection and mandatory-factor removal denial. No personal employee account or hosted platform setting is changed by the test suite.
- [x] Password change from a verified MFA session is tested with the real provider: wrong current password is rejected, a successful change revokes old ERP sessions, and the next password login still requires the enrolled authenticator.
- [x] Production-bundle Edge checks at 1440px/390px apply the configured security headers. All eight public route types render with every ERP API request blocked; inquiry drafts, forced enrollment/code verification, dashboard entry, old report-link filters and profile security pass without browser/CSP errors or horizontal overflow. Private setup QR/keys are never captured in screenshots.

Final local regression: 88 tests pass; twelve hosted suites are opt-in/skipped by default. Build, frontend/API type checks, lint and release checks pass. The separate hosted security/browser run passes all five checks, including real password changes. Hosted sales tests cover separate API workers, partial rounding, duplicate invoices, approval replay, allocated receipts, overpayment races, reversals and financial redaction. Finance tests cover expense/payment competition for the same cash, private receipts, snapshot isolation, source validation and journal tamper rejection. Report checks exercise every available SQL query/filter, grouped sales, dated reversals, as-of stock/customer/supplier/cash position and source/print/export denial. Desktop/390px Sales and Accounts walkthroughs pass, including read-only MD access and Sales Executive direct-URL denial. Import/master/inventory/receiving and dashboard/settings browser regressions also pass. The 25 October read-only service check had zero failures and one warning about a plaintext password comment in the ignored local `.env`.

## Remaining Implementation

- [ ] Verified opening receivables/data migration; customer CRUD already persists assignments and contact details.
- [ ] Approved opening balances and historical/backdated finance entry policy. Current cash posting enforces chronological dates and sufficient funds; financial-position sources are not a full general ledger.
- [ ] Opening stock, returns, stock adjustments and the approved rejected-goods loss/claim treatment.
- [ ] Field-device/privacy/retention and deployed acceptance for the implemented event-based check-in; no browser attendance-proof or continuous-GPS claim.
- [ ] Dynamic public CMS, controlled editorial media uploads and persisted website inquiries are deferred by the latest scope, not prerequisites for the static brochure release.
- [ ] Approved Balance Sheet/opening reconciliation. The SQL-backed dashboard and 61 supported operational/employee/visit reports, CSV and letterhead previews are connected; pending-source reports are explicitly unavailable, not populated from fixtures.
- [ ] Connect the final existing ERP navigation to these persistent services; no mock fixtures in production screens.
- [ ] Durable invitation retry/outbox, broader orphan-upload cleanup and operational monitoring. Explicit Pending-invitation retry already exists.
- [ ] Least-privilege runtime DB role and remaining bounded/paginated operational queries. Production headers and credential-free CI/release checks are implemented.

## Launch Acceptance

- [x] Independent API-instance persistence, stock/money concurrency and idempotent retry tests for imports, sales and operating finance.
- [ ] Deployed staging/redeploy acceptance for all domains, not just local API instances.
- [ ] Every role tested for routes, actions, own/team records, sensitive fields and private files.
- [ ] All report/print/CSV totals reconcile with posted transactions, including reversals.
- [ ] Database **and file** restore drill, operational alerting, staging acceptance and rollback rehearsed.
- [ ] Identify/export the authoritative prototype records before cutover. Fixtures cannot recover lost in-memory edits. Import/reconcile approved data without resetting destination records.

## Account-Holder Actions

No new provider settings, environment values, Docker or manual database migration are needed to keep developing this increment. The following actions are still required at their relevant launch/acceptance stage:

1. Before email acceptance testing, configure a verified SMTP sender in Supabase and accept your own administrator setup link privately. Do not send passwords or links in chat.
2. Before production, rotate the exposed development credentials, establish company-owned accounts/billing, and create isolated production credentials/project. Do not put production secrets on arbitrary preview branches.
3. Supply the available source export and have the client approve opening stock, customer/supplier balances, cash/bank and rejected-goods treatment.
4. Approve exact production/staging URLs, enroll privileged accounts in their own authenticators, and confirm deployment environment values, backup retention and recovery ownership. Nothing has been deployed or changed in your provider environment automatically.
5. Have the client approve employee location/photo notices, retention/legal-hold rules and perform actual Android/iPhone HTTPS field tests. Do not enable production visit submissions before that approval. Photo remains optional with an explicit no-photo reason.

## Next Development Order

1. Obtain approved opening-data exports/reconciliation and stock-return/rejected-goods policies before implementing their production postings. Preserve existing history; no automatic balancing figures.
2. Durable invitation outbox/retries, approved retention workers, least-privilege runtime credentials, remaining query limits, monitoring and restore drills.
3. Consolidate the final ERP navigation, then complete staged deployment/redeploy, every-role UAT and rollback acceptance. `/backend` remains the migration workspace until these gates pass.
4. Optional later phases: dynamic public editorial/inquiry management and separately authorized AI. The current public website stays static and the ERP sends no data to an AI provider.

No Docker or separate backend repository/host is required for the selected Vercel Express + hosted Supabase architecture. Do not switch the deployed demo to foundation mode until the remaining workflows and launch acceptance are complete.
