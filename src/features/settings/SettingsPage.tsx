import { Bell, Bot, Building2, Database, FileText, Globe2, KeyRound, Landmark, LockKeyhole, Printer, Settings, ShieldCheck, Warehouse, Wifi } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { useToastStore } from "../../lib/ui/toast";

type SettingField = {
  key: string;
  label: string;
  value: string;
  type?: "text" | "select" | "toggle";
  options?: string[];
};

type SettingGroup = {
  title: string;
  body: string;
  status: string;
  icon: typeof Building2;
  fields: SettingField[];
};

const groups: SettingGroup[] = [
  {
    title: "Company & Branch Setup",
    body: "Company, branch, logo, BIN, sales office and multi-company operating scope.",
    status: "Configured",
    icon: Building2,
    fields: [
      { key: "companyName", label: "Primary Company", value: "Mipro HealthCare Corp." },
      { key: "branchMode", label: "Branch Mode", value: "Company + Branch Scope", type: "select", options: ["Company + Branch Scope", "Single Company", "Sandbox Company"] },
      { key: "language", label: "Language Readiness", value: "English UI / Chinese-ready keys" }
    ]
  },
  {
    title: "Warehouse, Barcode & FEFO",
    body: "Warehouse, BIN, batch, LOT, expiry, physical count, barcode/QR/UDI readiness.",
    status: "Active",
    icon: Warehouse,
    fields: [
      { key: "issuePolicy", label: "Issue Policy", value: "FEFO", type: "select", options: ["FEFO", "FIFO", "Manual Override"] },
      { key: "expiryAlerts", label: "Expiry Alerts", value: "6M / 3M / 1M" },
      { key: "barcode", label: "Barcode / QR / UDI", value: "Enabled", type: "toggle" }
    ]
  },
  {
    title: "Approval Workflow",
    body: "PI, PO, discount, landed-cost, voucher, return and physical-count approval rules.",
    status: "Human Controlled",
    icon: Settings,
    fields: [
      { key: "poApproval", label: "PO Approval", value: "Managing Director", type: "select", options: ["Managing Director", "Super Admin", "Import Manager"] },
      { key: "discountApproval", label: "Discount Approval", value: "Sales Manager", type: "select", options: ["Sales Manager", "Managing Director", "Super Admin"] },
      { key: "finalLock", label: "Finalized Record Lock", value: "Enabled", type: "toggle" }
    ]
  },
  {
    title: "Security, 2FA & IP Restriction",
    body: "Authentication policy, per-user 2FA, IP allowlist and sensitive finance protection.",
    status: "Ready",
    icon: LockKeyhole,
    fields: [
      { key: "twoFactor", label: "2FA Required", value: "Enabled", type: "toggle" },
      { key: "ipPolicy", label: "IP Policy", value: "Head office + approved devices" },
      { key: "costPrivacy", label: "Sales Cost Privacy", value: "Enabled", type: "toggle" }
    ]
  },
  {
    title: "Tax, VAT & Currency",
    body: "VAT, AIT, duty, exchange rate and multi-currency import controls.",
    status: "Configured",
    icon: Landmark,
    fields: [
      { key: "baseCurrency", label: "Base Currency", value: "BDT", type: "select", options: ["BDT", "USD", "CNY"] },
      { key: "importCurrency", label: "Import Currency", value: "USD", type: "select", options: ["USD", "CNY", "BDT"] },
      { key: "taxProfile", label: "Tax Profile", value: "VAT + AIT + Duty" }
    ]
  },
  {
    title: "Print Templates",
    body: "Quotation, PO, challan, invoice, receipt, GRN, payslip and report print format.",
    status: "Ready",
    icon: Printer,
    fields: [
      { key: "header", label: "Header", value: "Logo + Company Address" },
      { key: "signature", label: "Signature Blocks", value: "Prepared By / Checked By / Approved By" },
      { key: "terms", label: "Terms Footer", value: "Enabled", type: "toggle" }
    ]
  },
  {
    title: "AI & Document Extraction",
    body: "AI document extraction, costing, inventory risk, sales follow-up and insight agents.",
    status: "Human Approval",
    icon: Bot,
    fields: [
      { key: "aiMode", label: "AI Mode", value: "Assist only", type: "select", options: ["Assist only", "Suggest draft", "Disabled"] },
      { key: "documentAgent", label: "Document Agent", value: "Enabled", type: "toggle" },
      { key: "approvalRequired", label: "Human Approval", value: "Enabled", type: "toggle" }
    ]
  },
  {
    title: "API, Backup & Mobile Sync",
    body: "Backend-ready API versioning, storage, backup, offline mobile sync and deployment controls.",
    status: "Backend Ready",
    icon: Database,
    fields: [
      { key: "apiVersion", label: "API Version", value: "/api/v1" },
      { key: "backup", label: "Daily Offsite Backup", value: "Enabled", type: "toggle" },
      { key: "mobileSync", label: "Offline Mobile Sync", value: "Prepared", type: "select", options: ["Prepared", "Enabled", "Disabled"] }
    ]
  }
];

function fieldId(group: string, key: string) {
  return `${group}:${key}`;
}

export default function SettingsPage() {
  const pushToast = useToastStore((state) => state.push);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const entries = groups.flatMap((group) => group.fields.map((field) => [fieldId(group.title, field.key), field.value]));
    return Object.fromEntries(entries);
  });

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="System Settings"
        subtitle="Functional frontend configuration for company, warehouse, approval, security, tax, print, AI, API, backup and mobile sync rules."
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            <ShieldCheck className="h-4 w-4" />
            Production policy mock
          </span>
        }
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={group.title}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">{group.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{group.body}</p>
                  </div>
                </div>
                <StatusBadge status={group.status} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {group.fields.map((field) => {
                  const id = fieldId(group.title, field.key);
                  const value = values[id] ?? field.value;
                  return (
                    <label className="grid gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3" key={field.key}>
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{field.label}</span>
                      {field.type === "toggle" ? (
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-800">{value}</span>
                          <input
                            checked={value === "Enabled"}
                            className="h-5 w-5 rounded border-slate-300 text-teal-700"
                            type="checkbox"
                            onChange={(event) => setValues((current) => ({ ...current, [id]: event.target.checked ? "Enabled" : "Disabled" }))}
                          />
                        </span>
                      ) : field.type === "select" ? (
                        <select
                          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800"
                          value={value}
                          onChange={(event) => setValues((current) => ({ ...current, [id]: event.target.value }))}
                        >
                          {(field.options ?? []).map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800"
                          value={value}
                          onChange={(event) => setValues((current) => ({ ...current, [id]: event.target.value }))}
                        />
                      )}
                    </label>
                  );
                })}
              </div>
              <Button className="mt-4" variant="primary" onClick={() => pushToast({ kind: "success", title: `${group.title} saved` })}>
                Save {group.title}
              </Button>
            </section>
          );
        })}
      </div>
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4">
        {[
          ["2FA", "Per-user toggle ready", KeyRound],
          ["IP Policy", "Office/device allowlist", Wifi],
          ["Alerts", "Expiry, dues, approvals", Bell],
          ["Localization", "English now, Chinese-ready", Globe2],
          ["Print", "All business documents", FileText],
          ["Storage", "Supabase/DB-ready", Database]
        ].map(([title, body, Icon]) => (
          <div className="rounded-lg bg-slate-50 p-4" key={title as string}>
            <Icon className="h-5 w-5 text-teal-700" />
            <h3 className="mt-3 font-bold text-slate-950">{title as string}</h3>
            <p className="mt-1 text-sm text-slate-500">{body as string}</p>
          </div>
        ))}
      </section>
    </>
  );
}
