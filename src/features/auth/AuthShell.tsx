import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-32"
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=80"
            alt="Medical distribution warehouse"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/92 to-teal-950/78" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-600 text-white">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <strong className="block text-xl">Mipro ERP</strong>
                <span className="text-sm text-slate-300">Medical Import & Distribution</span>
              </div>
            </div>
            <h1 className="mt-20 max-w-3xl text-5xl font-bold leading-tight">
              Connected import, warehouse, sales, accounts, reporting and AI-assisted control.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Built for Bangladeshi medical suppliers managing China procurement, customs, landed cost, batch traceability,
              hospital sales and collection risk.
            </p>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {[
              ["17,500", "Units in stock"],
              ["BDT 3.97M", "Revenue tracked"],
              ["7 Roles", "RBAC protected"]
            ].map(([value, label]) => (
              <div className="rounded-xl border border-white/10 bg-white/10 p-4" key={label}>
                <strong className="block text-2xl">{value}</strong>
                <span className="text-sm text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </section>
        <main className="flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Secure ERP Access</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
