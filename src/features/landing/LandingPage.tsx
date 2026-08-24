import { ArrowRight, Boxes, Calculator, FileText, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import MiproLogo from "../../components/branding/MiproLogo";
import Button from "../../components/ui/Button";

const modules = [
  ["Connected Imports", "PO, supplier, PI, LC/TT, shipment, costing and receipt in one continuing case.", FileText],
  ["Shipment Control", "BL, container, vessel, ETA and final customs assessment records.", Truck],
  ["FIFO Inventory", "Warehouse receipt, batch, LOT, location, expiry and FIFO dispatch.", Boxes],
  ["Landed Cost", "CBM, FOB, quantity, product-specific and manual allocation.", Calculator]
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
          <MiproLogo className="h-[49px] w-[190px] sm:h-[58px] sm:w-[228px]" priority />
          <div className="flex gap-2">
            <Link className="hidden sm:block" to="/signup">
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
        <section className="relative overflow-hidden bg-blue-950 px-4 py-16 text-white sm:py-20">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-25"
            src="/mipro-warehouse.png"
            alt="Medical warehouse"
          />
          <div className="absolute inset-0 bg-blue-950/85" />
          <div className="relative mx-auto max-w-7xl">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">Medical Import and Distribution</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">
                MIPRO Medical Supplier ERP
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                One connected operating system for China procurement, customs clearance, landed cost, batch traceability,
                hospital sales, payment collection, operating expenditure and management reporting.
              </p>
            </div>
            <div className="mt-10 border-y border-white/20 py-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
                {[
                  ["BDT 3.97M", "Delivered sales"],
                  ["17,500", "Batch-tracked units"],
                  ["BDT 1.28M", "Stock valuation"],
                  ["7", "ERP roles"]
                ].map(([value, label]) => (
                  <div key={label}>
                    <strong className="block text-2xl text-white">{value}</strong>
                    <span className="text-sm text-cyan-100">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 md:grid-cols-2 xl:grid-cols-4">
          {modules.map(([title, body, Icon]) => (
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" key={title as string}>
              <Icon className="h-6 w-6 text-cyan-700" />
              <h2 className="mt-3 text-lg font-bold text-slate-950">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{body as string}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
