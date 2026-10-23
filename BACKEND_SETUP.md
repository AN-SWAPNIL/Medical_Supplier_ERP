# MIPRO ERP Production Backend Setup

Updated: 23 October 2026.

The first backend foundation is now implemented and installed in the hosted development project. The full ERP business-data migration is not complete. This guide refines `files/MIPRO_ERP_Production_Backend_Architecture_Analysis_and_Roadmap.md`.

## Current Implementation Status

Implemented and applied to the development project:

- Versioned Drizzle migrations for the private employee/access, session, audit, upload-metadata and rate-limit tables. Destination backups are captured before migration/bootstrap. Re-running migrations was verified without resetting records.
- Real Supabase password authentication; verified email/invite recovery; HttpOnly, SameSite refresh cookies; token hashes and revocation in PostgreSQL; current-password verification for password changes. Recovery-only sessions cannot access ordinary ERP endpoints.
- Persisted employee roles/capabilities/overrides, optimistic access versions, delegated-authority checks, self-edit protection, session revocation after access changes, and append-only audit enforcement.
- Pending employee invitation reservations and retry endpoints. SMTP delivery remains a separate acceptance item; no employee/demo passwords are seeded.
- Private employee document/profile-photo upload authorization, direct Storage upload, signature/type/size verification, protected completion and short-lived read URLs. Business-document parent types will be added with their domain migrations.
- The configured development Super Admin identity and employee mapping were provisioned without a default password or automatic email confirmation. Its expiring setup link is held only under ignored `artifacts/private/`; no invitation email was sent by bootstrap.
- Private `erp-documents` and public `website-media` buckets were created with MIME/size restrictions. No unrestricted browser write policy was added. Business tables deny `anon`/`authenticated` access and have RLS enabled.
- Hosted Auth now disables public signup, keeps email login enabled, requires 12-character new passwords, and permits exact localhost recovery URLs on ports 5178 and 5173. Existing unrelated hosted configuration was preserved; its pre-change copy is under ignored `artifacts/hosted-config/`.

Existing prototype records and source fixtures were not overwritten, imported, reset or deployed. The new ERP namespace was empty before the first migration. Runtime-only prototype records still require an identified source/export before business-data cutover.

### Run The Isolated Foundation

```powershell
npm run dev:backend
```

This starts the persistent API on 4178 and the foundation web workspace at `http://localhost:5178/login`. It sets foundation/demo-isolation flags for that process only, without rewriting `.env`. Use `/backend` for foundation status and `/backend/profile` for persisted profile/photo/security. Existing `/app/*` routes redirect to this staging workspace in foundation mode; business workflows are deliberately unavailable rather than silently using mock arrays with real identities.

The helper is currently running locally in a hidden background process. Its `/api/health` endpoint returned HTTP 200 with `mode=foundation` and `database=connected`. Logs are under ignored `artifacts/backend/dev-server*.log`. The latest administrator setup link was issued into `artifacts/private/administrator-invitation-1792773711275.txt`; it is an expiring credential and must not be committed/shared. Request a fresh link with the explicit bootstrap command if it expires.

`npm run dev` remains the existing prototype. Do not switch the public demo or production to foundation mode yet. For an eventual deployment both `ERP_BACKEND_MODE` and `VITE_BACKEND_MODE` must agree, demo flags must be false, and `APP_URL`/Auth redirect URLs must use that deployment's actual HTTPS origin.

### Database And Administrator Commands

```powershell
npm run db:generate
npm run db:backup
npm run db:migrate -- --apply
npm run backend:bootstrap -- --apply
npm run test:backend
```

The default backend test command is local/unit-only and skips hosted mutations. To run the development hosted integration test, set `RUN_HOSTED_BACKEND_TESTS=true` in the test process only. It creates temporary `backend-*-UUID@example.invalid` identities/files, removes them afterward and retains Inactive employee/audit rows. `npm run backend:cleanup-tests -- --apply` removes only reserved temporary test identities after an interrupted run.

The minimal hosted-development Auth settings are versioned in `supabase/config.toml`. Review with `npx supabase config diff --project-ref YOUR_DEVELOPMENT_PROJECT_REF`, then explicitly push the reviewed changes if necessary. Do not push this localhost configuration to production. Keep `[auth.email].enable_signup=true` to retain email-provider login and `[auth].enable_signup=false` to disable public signup; the tested CLI maps these to different provider/global settings. This configuration does not require Docker.

To issue a fresh administrator link, run bootstrap with `--apply --issue-link` and `APP_URL=http://localhost:5178` supplied in that process. The new link is written to a timestamped private artifact, not printed or emailed. Open it only while the isolated foundation server is running. It expires; issuing a link does not change roles or a pre-existing administrator password.

### First Milestone Versus Remaining Work

The original 32 unit tests and mock API integration scenarios remain regression checks. The expanded hosted foundation suite passed all five tests, including verified recovery/password reset, login/refresh, restart persistence, access revocation, private signed upload/read and audit tamper rejection. Real-backend desktop/390px browser login/profile-save/reload/logout checks also passed, with screenshots under `artifacts/backend/`. That final hosted run used a process-only public-DNS resolver because the system resolver was intermittently failing; no runtime workaround or OS change was installed. Active-session password change is implemented but still needs its own end-to-end acceptance check, as do invitation email delivery and privileged MFA enforcement.

During later testing the Windows DNS resolver intermittently timed out resolving the Supabase pooler, while a direct public-DNS query resolved it. No database URL was pinned to an IP, OS DNS was not changed, and no runtime DNS workaround was installed. Treat these connection failures separately from application assertions; do not retry financial writes blindly. Provider calls now have bounded request timeouts.

Remaining waves: master/business data and preservation imports, import costing/stock transactions, the full sales/money lifecycle, remaining employee/marketing/site/report persistence, robust invitation delivery, privileged MFA enforcement, deployment/backup restore and client acceptance. This is a completed foundation increment, not a production-ready replacement for the entire ERP.

## What To Set Up Now

Only a development environment is needed to start. Do not connect this migration to live company data.

| Item                 | Your setup / information needed now                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase             | Existing `mipro-erp-dev` is accessible in Mumbai (`ap-south-1`). Use it for development only. |
| Database connections | Copy the transaction-pooler URL and a direct or session-pooler URL from Connect. Include the database password in the local connection strings.       |
| Supabase API keys    | Obtain the publishable key (`sb_publishable_...`) and a server-only secret key (`sb_secret_...`).                                                 |
| First Super Admin    | Provide name and a real email address. A personal email is fine during development.                                                                   |
| Data status          | Confirmed: preserve existing records. Export and reconcile before migration; do not reset or overwrite. |
| URLs                 | Confirm the local URL (normally `http://localhost:5173`) and a stable development deployment URL when available.                                    |

Put credentials in the Git-ignored local `.env`, not in chat or committed files. No account password, JWT signing secret, or Supabase management access token is required for ordinary application/database integration.

Vercel project/team access is needed when deploying staging, not before local coding. Existing authenticated CLI access can be used. Custom SMTP, production projects, company domain and production opening balances can follow before their respective acceptance tests and launch.

Do not manually create ERP tables or seed employee passwords. Repository migrations, bootstrap and seed commands will do that.

## Local Tools And Commands

Hosted Supabase is the selected workflow. Docker is not required and will not be used for this setup.

Checked on 23 October 2026: Node.js `v24.12.0`, npm, Git, Vercel CLI and the project-local Supabase CLI are available. Vercel CLI authentication and Supabase access to the configured development project were verified. No deployment or remote schema change was performed.

### Recommended: Hosted Supabase With Local Application

No local Supabase server, Docker engine or Supabase CLI is required for this approach. The application runs locally and connects to the development Supabase project over the internet.

From the repository root in PowerShell:

```powershell
npm ci
npm run dev
```

The current scripts start Vite on `http://localhost:5173` and Express on port `4174`; Vite proxies `/api` to Express. Leave `VITE_API_BASE_URL` blank. These scripts currently start the existing prototype, not an implemented production backend. With demo mode disabled, demo sign-in can be unavailable until real authentication is wired in.

Runtime packages (`@supabase/supabase-js`, `drizzle-orm`, `postgres`) and migration tooling (`drizzle-kit`) are installed. Use the implemented schema/migration/bootstrap commands listed above rather than manually creating ERP tables.

Dependency ranges no longer use unrestricted `latest` tags. Updates stay within their selected major versions; TypeScript stays on 6.0 and Node types match the Node 24 runtime. A scoped override pins `@esbuild-kit/core-utils`'s esbuild dependency to `0.25.12` to address the advisory inherited through Drizzle Kit. Verify this override when upgrading migration tooling.

Run the reusable hosted-service check from the repository root:

```powershell
npm run check:backend
```

It reads the ignored `.env`, checks CLI project access, Auth settings/signing keys, administrator-key access, Storage bucket configuration and TLS database connectivity through both configured URLs. SQL runs in read-only transactions. It does not create users, send emails, create buckets, apply migrations or change settings. Results never print credentials or employee identities. A successful check is infrastructure readiness, not proof that the ERP's real authentication/backend is implemented.

If PowerShell blocks `npm.ps1` or `npx.ps1`, use `npm.cmd` / `npx.cmd` instead; changing execution policy is unnecessary. This agent may also require filesystem approval to access CLI credential stores; that is not a missing dependency.

### Vercel CLI: Already Installed

Run these interactively only when staging setup is needed:

```powershell
vercel --version
vercel login
vercel whoami
vercel link
```

Skip login if already authenticated. In `vercel link`, select the intended existing project/team, not a new project accidentally. Confirm whether it is the public demo or a separate backend staging project before deploying. Keep the generated `.vercel/` directory Git-ignored; do not commit downloaded environment files.

No deployment is required to begin local backend development. Vercel environment variables must be configured separately for the intended Development/Preview/Production environment; changing local `.env` does not update Vercel. Never give a demo deployment production credentials.

For optional Vercel-specific local testing, `vercel pull --environment=development` retrieves project settings and environment values for `vercel dev`. Ordinary `npm run dev` does not require either command. Do not run `vercel env pull .env` over the populated local file: it can overwrite local credentials. Also check for an old `.env.local`, which Vite prioritizes over `.env`.

### Supabase CLI: Installed For Hosted Project Management

The project-local CLI is installed and logged in. For a fresh workstation only, installation/login would be:

```powershell
npm install --save-dev --save-exact supabase
npx supabase --version
npx supabase login
```

CLI login is a separate account authorization, not the application secret key; complete its browser/token prompt locally without sharing tokens in chat. These commands manage hosted resources without Docker. Drizzle migrations will remain the single owner of ERP table changes; do not also apply parallel Supabase SQL migrations for the same tables.

Do not run `supabase start`, `db reset` or local-stack commands for this workflow. `supabase init` / `link` are not prerequisites for the selected direct database + Drizzle approach. If a later hosted CLI operation needs a linked project, link only the confirmed development project at that point.

### Verified Hosted Readiness And Outstanding Items

The read-only check passed for the configured `mipro-erp-dev` project in Mumbai (`ap-south-1`): project status healthy, publishable-key Auth access, published JWKS, secret-key administrator access, Storage API, transaction pooler on `6543`, and migration/session pooler on `5432`.

Initial warnings and their current status:

- Public signup was initially enabled; now disabled. Email/password login remains enabled.
- `erp-documents` (private) and `website-media` (public) were created with restricted types/sizes by foundation bootstrap.
- `.env` contains a plaintext password comment. Remove it. Credential rotation remains pending; the account holder explicitly authorized development work with the current development credentials. Rotation is still required before production use.
- Account holder confirmed existing records must be preserved. No current fixture was copied into Supabase.
- Actual login/reset, private upload authorization, private schema/RLS and initial migrations are implemented and tested. SMTP/invitation delivery, MFA enforcement, business-domain migrations and production deployment remain outstanding.

No Docker, additional backend host or further account installation is needed to start foundation work. CLI access does not remove account-holder responsibilities for billing, recovery links, SMTP/DNS and client data approval.

### Package And Baseline Verification

After dependency updates on 23 October 2026:

- `npm test`: the original 32 unit tests and four new foundation unit tests pass; hosted mutation testing is skipped unless explicitly enabled.
- `npm run test:flows`: existing mock API integration scenarios pass across imports, costing, FIFO, sales, accounts, reports, access control, marketing and public content.
- `npm run lint`: passes.
- `npm run build`: frontend production build and NodeNext API type checking pass.
- `npm audit`: zero reported vulnerabilities after the scoped tooling override. This is a dependency advisory check, not a production security audit.
- `npm ls --depth=0` and Drizzle Kit version checks pass.
- All five browser suites pass on isolated mock servers: general smoke, linked sales lifecycle, employee-report/search/printing, public website, and website content management. Desktop/mobile screenshots are in ignored `artifacts/`. The website-content suite now accepts the same test-server environment overrides as the other suites.

These tests establish the prototype baseline. The current foundation status above separately records the additive hosted migrations, administrator/bucket provisioning and real-backend tests; it does not claim that the remaining business workflows are persistent.

### Remaining Checks Before Coding And Launch

- Rotate the database password and Supabase secret key exposed in chat; update local values without reposting them. Remove any plaintext password comment.
- Obtain both database URIs from Dashboard > Connect. Encode reserved password characters inside the URI (for example, `#` becomes `%23`); quotes alone do not encode them. Use plain `#` comments, never Markdown `*#` lines or Markdown links in `.env`.
- Use the confirmed development project without treating existing records as disposable. Preserve records under the migration procedure below; retest connectivity after credential rotation.
- Auth email/password, invitation-only signup and exact local recovery URLs are configured. Add exact staging/production URLs separately before those deployments.
- Use a real receiving address for the first administrator. Custom SMTP is required before complete employee invitation/reset tests; company production ownership, DNS and launch data can follow later.
- Keep demo flags false for the real-backend environment. This is a security setting, not an authentication implementation; use a separate controlled mock environment if the demo must remain usable during migration.

## Confirmed Data Preservation Requirement

The account holder requires existing records to be preserved. Before migration, identify the authoritative running deployment/local instance, any exported files, and any existing Supabase records. Repository fixtures do not contain changes made only in a running in-memory API, and browser preferences/session storage are not a complete business-data backup. In-memory changes may already be unavailable after a restart or serverless instance replacement; do not promise recovery without a captured source.

1. Identify the source instances and arrange a quiet export window before a redeploy or restart where possible.
2. Capture authorized exports of accessible business records, relationships, document contents and settings to protected, Git-ignored storage. Back up any existing destination records before changing them. Do not migrate mock passwords or reusable demo tokens.
3. Reconcile counts, IDs, linked documents, stock quantities, receivables/payables and cash/bank balances; record any unavailable source data explicitly.
4. Implement an idempotent migration into the development database, preserving source IDs or an explicit mapping and retaining original exports. Do not use destructive reset/truncate commands or blindly overwrite destination rows.
5. Verify totals and relationships, obtain acceptance and retain a rollback copy before switching the application to persisted data. Link employees to real Auth identities through controlled provisioning.

The account holder explicitly authorized development work with the current development credentials while rotation is pending. Do not reuse them for production. Source location and export availability for runtime prototype records still need confirmation before business-data cutover.

## Selected Architecture

Keep one repository and the existing React/Vite + TypeScript/Express stack.

```text
Browser: React/Vite on Vercel
  -> Supabase Auth for login/session
  -> same-origin /api/* for ERP operations
       -> Express verifies user identity and persisted access rules
       -> Drizzle + Supabase PostgreSQL for business transactions
       -> Supabase Storage for authorized upload/read instructions

Browser file bytes -> Supabase Storage directly
```

Vercel already hosts the HTTP backend through `api/index.ts`. No separate backend host or second repository is needed initially. Supabase supplies persistent database, authentication and storage services.

Keep existing frontend DTOs, React Query services, routes and print flows. Introduce `database/`, `server/auth/`, `server/repositories/`, `server/services/` and `server/routes/` incrementally. A wholesale move into `apps/*` and packages is optional later.

Use Drizzle ORM + Postgres.js, Zod, Decimal.js and PostgreSQL `numeric` columns. Choose precision per field; do not round authoritative unit cost to two decimals merely because BDT document totals use two decimals.

## Development Environment Variables

These variables configure the implemented opt-in foundation. The legacy mock business workflows do not become persistent merely by setting them.

```dotenv
# Server only: development project
DATABASE_URL=<transaction-pooler connection string>
DATABASE_MIGRATION_URL=<direct or session-pooler connection string>
SUPABASE_URL=<development project URL>
SUPABASE_PUBLISHABLE_KEY=<sb_publishable_...>
SUPABASE_SECRET_KEY=<sb_secret_...>

# Public browser authentication configuration
VITE_SUPABASE_URL=<same development project URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<same publishable key>

# Same-origin web/API deployment
VITE_API_BASE_URL=

# Real-backend environments must not expose demo login
VITE_DEMO_MODE=false
DEMO_MODE=false
```

Use `.env` for local setup: the current Express entry loads that file, whereas the earlier `.env.local` recommendation did not match its loader. Keep `.env.example` free of real credentials. Never put database passwords or secret keys in `VITE_*` variables.

Use the transaction pooler for runtime requests with Postgres.js prepared statements disabled (`prepare: false`) and a small application connection pool. Use the separate migration connection for controlled migration commands; do not run schema migrations on every function request. Choose the session pooler for migrations when direct IPv6 connectivity is unavailable.

## Supabase Dashboard Setup

1. Create the development project and record its region. Preserve database credentials locally.
2. In Authentication, enable email/password and disable open sign-up for employees.
3. Set the development Site URL and allow only the local/development callback and reset URLs implemented by the app. Configure production URLs in its separate project later.
4. Create `erp-documents` as private and `website-media` as public. The implementation can alternatively create these with an idempotent setup command.
5. Configure bucket MIME/size restrictions and access policies. Do not add an unrestricted browser write policy.
6. Keep business tables in a private schema where practical; restrict grants and apply RLS wherever tables are exposed through Supabase's Data API. The browser uses the Express API for protected ERP data.

A privileged SQL connection or Supabase secret key can bypass RLS. Every business API operation must independently enforce identity, active employee status, role overrides, capabilities and record scope.

## Authentication And Registration Scope

The backend implementation includes login, logout, session refresh, invitation acceptance/account activation, password recovery/reset, profile updates, privileged MFA flows, and persisted role/access management.

Registration for this internal ERP is controlled:

- A one-time server-side bootstrap provisions the first Super Admin and links the Auth UUID to the employee record.
- Super Admin or an authorized employee manager invites permitted employees.
- Employees accept the invitation and set their own passwords.
- Public visitors cannot register themselves as employees or choose an administrator role.
- Supabase verifies identity; the business database remains authoritative for roles, capabilities and SELF/TEAM/ALL access.
- Express verifies access tokens and ignores client-supplied `x-user-id`/`x-role` as trusted identity.
- Role changes, inactive accounts, expired tokens and unauthorized direct URLs must be tested.

Do not copy demo accounts or passwords into production.

## Personal Email And SMTP

A personal email may be used for the developer's Supabase/Vercel account and the first development ERP administrator. Move production ownership and recovery contacts to company-controlled accounts before handover.

The recipient/login email and the email sender are different things. Using Gmail to log in does not configure Gmail as the application's sending service.

Supabase's default mail service is restricted to project-team recipients and limited testing. It is not sufficient for testing invitations to arbitrary employees or for production.

Before full invitation/reset acceptance tests:

1. Set up a transactional SMTP provider such as Resend or the company's existing provider.
2. Verify a sender domain through its DNS records.
3. Configure SMTP host, port, username, password, sender address and sender name in Supabase Authentication.
4. Test invitation and password-reset delivery, redirect handling, expiration and link reuse.

SMTP credentials configured in Supabase do not also need to be supplied to Express unless separate application notification emails use that provider. Company domain/DNS and SMTP can wait while database and authentication foundations are built.

## File Upload And Download Flow

File bytes must not pass through the Express/Vercel JSON API as base64.

1. The browser asks the authenticated API for an upload authorization, stating document purpose, parent record, filename, MIME type and size.
2. The API checks access, assigns an object path and records an upload intent. It returns a short-lived signed upload URL/token.
3. The browser uploads the bytes directly to Supabase Storage.
4. The browser submits the upload identifier/object path and metadata to the API.
5. The API verifies that the object belongs to that authorized upload, exists, and satisfies the restrictions before attaching it to the business record.
6. When opened, the API checks permission again and generates a short-lived signed read URL for private files.

Persist bucket, object path, original filename, MIME type, size, parent record, uploader and timestamps. A checksum may be added for integrity. Do not treat an arbitrary client-supplied URL as proof of a valid upload.

Do not store expiring signed URLs as permanent document addresses. Public website assets may have stable public URLs; confidential ERP files stay private. Profile photos and employee evidence are private by default.

Choose standard versus resumable uploads by file size and reliability needs. Supabase recommends resumable uploads above 6 MB. Add cleanup for abandoned upload intents and unlinked objects. Keep database and file-object recovery plans separate.

## Full Backend Scope And Implementation Order

The target is the full existing ERP backend, delivered in stages rather than only a login/database demo.

| Stage                   | Deliverables                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Foundations          | Database/migrations, real authentication, administrator bootstrap, employee access, durable audit, separate demo mode and dependency health checks                                                |
| 2. Import and inventory | Product/supplier/customer masters, import costs and immutable snapshots, receiving, batches, stock movements and atomic FIFO                                                                      |
| 3. Sales and money      | Quotations, orders and Update 11 lifecycle, deliveries, invoices/approval/reversal, collections and allocations, customer ledger, accounts, expenses, supplier settlements and financial position |
| 4. Remaining modules    | Employee/marketing/field records, settings, website administration/inquiries, documents, SQL-backed reports, CSV and existing print integration                                                   |
| 5. Launch               | Verified opening records, concurrency/retry tests, backup restoration, staging acceptance, production deployment and rollback procedure                                                           |

Fix the previously identified costing issues during Stage 2: foreign-currency manual split reconciliation, authoritative unit-cost precision and stale calculation documentation.

Use database foreign keys and uniqueness constraints, database-backed document numbering, and idempotency keys for posting commands. Lock or conditionally update stock/balance records within transactions to prevent concurrent overselling, duplicate approvals and double payments.

Delivery changes stock only; approved invoices post receivables; posted collections credit receivables and increase the destination account. Finalization, receiving, delivery, invoice approval/reversal, collection, expense and supplier payment each require an all-or-nothing transaction with audit history.

## Vercel, Environments And Hosting

Keep the Vite preset, `npm run build`, output `dist`, and same-origin `/api/*`. Leave `VITE_API_BASE_URL` blank.

For staging deployment, provide the Vercel project/team identifier, authenticated deployment access, stable staging URL and the intended production branch. Do not assume `dev` is production. Keep the public demo on isolated mock data if it must remain available during migration.

Set Preview/Development credentials to the development Supabase project. Before launch create an independent production Supabase project, configure its Auth URLs/storage, and apply reviewed migrations and approved data. Never allow an arbitrary preview branch to receive production database or storage secrets.

Set the API function region near the database. Use a commercial-appropriate Vercel plan for company deployment; Hobby is limited to non-commercial personal use. Select paid production database service and establish backup/restore procedures before live financial use. Extra environments, compute, email and usage may add charges.

A separate persistent Express service is needed only if measurements or requirements warrant independent scaling, long-running processing, private networking, persistent WebSockets or dedicated workers. The same API can move later; authoritative state must always remain in PostgreSQL/object storage.

## Acceptance Before Production

- Redeploy/restart preserves all posted records.
- Concurrent stock dispatch cannot oversell; retried posting cannot duplicate money or stock movements.
- Forged headers, expired tokens, inactive employees and cross-owner requests are rejected.
- Private documents and sensitive cost/profit enforce capabilities and scope.
- Import totals, unit costs, FIFO, receipts, invoice approval/reversal and collection ledgers reconcile.
- Reports screen/CSV/print and order lifecycle query the same authoritative records.
- Invitations, recovery, logout and privileged account protection work with the configured provider.
- Restore a database backup and recover stored files in a tested procedure.
- Reconcile client-approved opening stock, receivables, supplier balances and cash/bank before cutover.
- Production demo endpoints are disabled.

The developer can implement and test the code and configure services through available authorized access. Account creation, billing, email-link acceptance, DNS changes without access, and client approval of opening balances still require the account holder or client.

## Official Setup References

- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase CLI installation](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Supabase local development and Docker](https://supabase.com/docs/guides/local-development)
- [Supabase database connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase with Drizzle](https://supabase.com/docs/guides/database/drizzle)
- [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase storage access](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Supabase upload guidance](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
- [Vercel function limits](https://vercel.com/docs/functions/limitations)
- [Vercel CLI login](https://vercel.com/docs/cli/login)
- [Vercel CLI project setup](https://vercel.com/docs/projects/deploy-from-cli)
- [Vercel environment download behavior](https://vercel.com/docs/cli/pull)
- [Vercel Hobby policy](https://vercel.com/docs/plans/hobby)
