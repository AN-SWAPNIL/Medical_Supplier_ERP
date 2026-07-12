import { ArrowRight, Bot, Boxes, FileText, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";

const modules = [
  ["Procurement", "Supplier inquiry, PI, PO, LC/TT and supplier performance.", FileText],
  ["Shipment & Customs", "BL, container, vessel, ETA, documents and landed cost.", Truck],
  ["Warehouse", "GRN, BIN, batch, LOT, expiry and FEFO stock issue.", Boxes],
  ["AI Agents", "Document extraction, risk alerts and executive summaries.", Bot]
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <strong className="block text-slate-950">Mipro ERP</strong>
              <span className="text-xs text-slate-500">Medical Import & Distribution</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/signup">
              <Button>Request Access</Button>
            </Link>
            <Link to="/login">
              <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />}>
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className="relative overflow-hidden bg-slate-950 px-4 py-20 text-white">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-28"
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=80"
            alt="Medical warehouse"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-teal-950/75" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">Frontend ERP Prototype</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">
                Complete medical import, warehouse, sales, accounts and AI control surface.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Built for Mipro HealthCare-style operations: China procurement, customs clearance, landed cost, batch traceability,
                hospital sales, collection and management reporting.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["BDT 3.97M", "Sales ledger"],
                  ["17,500", "Stock units"],
                  ["BDT 1.28M", "Inventory value"],
                  ["7", "ERP roles"]
                ].map(([value, label]) => (
                  <div className="rounded-xl bg-white p-4 text-slate-950" key={label}>
                    <strong className="block text-2xl">{value}</strong>
                    <span className="text-sm text-slate-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 md:grid-cols-2 xl:grid-cols-4">
          {modules.map(([title, body, Icon]) => (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={title as string}>
              <Icon className="h-6 w-6 text-teal-700" />
              <h2 className="mt-3 text-lg font-bold text-slate-950">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{body as string}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
