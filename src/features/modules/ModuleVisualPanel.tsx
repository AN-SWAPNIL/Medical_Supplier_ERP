import { ArrowRight, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";
import type { EntityRecord, ModuleConfig } from "../../types";

type ModuleVisualPanelProps = {
  config: ModuleConfig;
  rows: EntityRecord[];
  totals: {
    total: number;
    posted: number;
    attention: number;
  };
};

type VisualConfig = {
  image: string;
  title: string;
  caption: string;
  chips: string[];
};

const visualsByPermission: Partial<Record<ModuleConfig["permission"], VisualConfig>> = {
  "master-data": {
    image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1200&q=80",
    title: "Clean master data keeps every department aligned.",
    caption: "Company, warehouse, SKU, customer and employee records become the source of truth for the full ERP.",
    chips: ["Single source of truth", "Configurable records", "Audit-ready setup"]
  },
  products: {
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
    title: "Medical product master with price, device type and traceability.",
    caption: "Product/SKU records support batch, LOT, expiry, landed cost, sales pricing and reorder control.",
    chips: ["SKU images", "Batch/expiry ready", "Reorder levels"]
  },
  suppliers: {
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
    title: "Overseas supplier control starts before the first PO.",
    caption: "Supplier profiles connect inquiry, PI, PO, LC/TT, shipment documents and performance tracking.",
    chips: ["China procurement", "Payment terms", "Supplier rating"]
  },
  customers: {
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80",
    title: "Hospital, clinic, dealer and pharmacy CRM visibility.",
    caption: "Customer records drive credit limits, territory ownership, visit history, quotation and collection flows.",
    chips: ["Credit control", "Territory ownership", "Visit history"]
  },
  procurement: {
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
    title: "Procurement is connected from inquiry to approved PO.",
    caption: "The proposal requires supplier inquiry, PI approval and purchase orders to flow into LC/TT and shipment tracking.",
    chips: ["Inquiry", "PI approval", "PO workflow"]
  },
  import: {
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80",
    title: "Import officers can trace LC, TT and document movement.",
    caption: "LC number, bank, TT, Swift copy, expiry date and shipment timeline stay visible before customs.",
    chips: ["LC / TT", "Swift copy", "Status timeline"]
  },
  shipments: {
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=80",
    title: "Shipment readiness, container and document archive.",
    caption: "BL, container, vessel, ETD, ETA, COA, CE, ISO and packing list records stay centralized.",
    chips: ["BL tracking", "Container", "Document archive"]
  },
  customs: {
    image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1200&q=80",
    title: "Landed cost gives true product profitability.",
    caption: "FOB, freight, insurance, duty, VAT, AIT, port, C&F, transport and approved expenses produce per-unit cost.",
    chips: ["Cost allocation", "Margin preview", "Approval required"]
  },
  warehouse: {
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    title: "GRN, quarantine, rejected stock and BIN assignment.",
    caption: "Warehouse users capture received quantity, rejected quantity, batch, LOT, expiry date and BIN location.",
    chips: ["GRN", "BIN location", "Rejected stock"]
  },
  inventory: {
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
    title: "Batch, LOT, expiry and FEFO stock control.",
    caption: "Inventory views show real-time stock, stock movements, valuation, aging, low stock and batch recall traceability.",
    chips: ["FEFO", "Expiry alerts", "Batch recall"]
  },
  sales: {
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80",
    title: "Quotation to invoice to collection, with role-safe CRM.",
    caption: "Sales flow follows quotation, sales order, challan, invoice, return and collection, scoped by sales ownership.",
    chips: ["Quotation", "Invoice", "Collection"]
  },
  accounts: {
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    title: "Finance closes the operational loop.",
    caption: "Cash book, bank book, GL, vouchers, receivables, payables, P&L and balance-sheet data support management decisions.",
    chips: ["Ledger", "Receivable", "Payable"]
  },
  expenses: {
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    title: "Department-wise operational expense control.",
    caption: "Rent, fuel, salary, marketing, maintenance and other expenses move through approval and reporting.",
    chips: ["Approval", "Allocation", "Expense report"]
  },
  hr: {
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    title: "HR and payroll support the operating business.",
    caption: "Employee master, attendance, leave, salary, bonus, advance, loan, payroll and payslip print views are represented.",
    chips: ["Employees", "Payroll", "Payslip"]
  },
  transport: {
    image: "https://images.unsplash.com/photo-1556122071-e404eaedb77f?auto=format&fit=crop&w=1200&q=80",
    title: "Delivery cost and vehicle movement visibility.",
    caption: "Vehicle, driver, trip, fuel, delivery cost allocation and maintenance schedules support distribution operations.",
    chips: ["Trips", "Fuel", "Maintenance"]
  }
};

const defaultVisual: VisualConfig = {
  image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1200&q=80",
  title: "Connected ERP workflow with traceable records.",
  caption: "Each record supports search, filters, validation, actions, audit readiness and future Supabase replacement.",
  chips: ["CRUD", "RBAC", "Reports"]
};

export default function ModuleVisualPanel({ config, rows, totals }: ModuleVisualPanelProps) {
  const visual = visualsByPermission[config.permission] ?? defaultVisual;
  const primaryStatus = rows[0]?.status ? String(rows[0].status) : "Ready";

  return (
    <section className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:grid-cols-[1fr_380px]">
      <div className="relative min-h-[250px] p-5 text-white">
        <img className="absolute inset-0 h-full w-full object-cover" src={visual.image} alt={visual.title} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-slate-900/78 to-teal-950/62" />
        <div className="relative flex h-full flex-col justify-between gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-200">{config.title}</p>
            <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-tight sm:text-3xl">{visual.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">{visual.caption}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {visual.chips.map((chip) => (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur" key={chip}>
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-200" />
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid content-between gap-3 p-5">
        <div className="grid gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-500">Proposal Fit</p>
              <ShieldCheck className="h-5 w-5 text-teal-700" />
            </div>
            <strong className="mt-2 block text-xl text-slate-950">Workflow + approval + audit</strong>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="rounded-xl bg-slate-50 p-3">
              <small className="block text-xs font-semibold text-slate-500">Records</small>
              <strong className="text-xl text-slate-950">{totals.total}</strong>
            </span>
            <span className="rounded-xl bg-emerald-50 p-3">
              <small className="block text-xs font-semibold text-emerald-700">Ready</small>
              <strong className="text-xl text-emerald-800">{totals.posted}</strong>
            </span>
            <span className="rounded-xl bg-amber-50 p-3">
              <small className="block text-xs font-semibold text-amber-700">Attention</small>
              <strong className="text-xl text-amber-800">{totals.attention}</strong>
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Current signal</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-800">{primaryStatus}</span>
              <ArrowRight className="h-4 w-4 text-teal-700" />
              <span className="text-sm font-semibold text-slate-800">Next workflow action</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 p-3 text-sm font-semibold text-teal-800">
          <FileCheck2 className="h-4 w-4" />
          Data loads through mock API and can later be replaced by Supabase.
        </div>
      </div>
    </section>
  );
}
