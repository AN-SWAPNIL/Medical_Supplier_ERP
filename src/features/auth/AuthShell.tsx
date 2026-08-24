import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import MiproLogo from "../../components/branding/MiproLogo";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-blue-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-32"
            src="/mipro-warehouse.png"
            alt="Medical distribution warehouse"
          />
          <div className="absolute inset-0 bg-blue-950/88" />
          <div className="relative">
            <Link className="inline-block rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-blue-950" to="/" aria-label="Go to MIPRO ERP home">
              <MiproLogo className="h-[74px] w-[292px] rounded-md shadow-sm" priority />
            </Link>
            <h1 className="mt-16 max-w-3xl text-5xl font-bold leading-tight">
              Connected import cases, FIFO inventory, sales, collections and operational accounts.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Built for Bangladeshi medical suppliers managing China procurement, customs, landed cost, batch traceability,
              hospital sales and collection risk.
            </p>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {[
              ["17,500", "Units in stock"],
              ["BDT 3.97M", "Delivered sales"],
              ["7 Roles", "RBAC protected"]
            ].map(([value, label]) => (
              <div className="rounded-md border border-white/10 bg-white/10 p-4" key={label}>
                <strong className="block text-2xl">{value}</strong>
                <span className="text-sm text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </section>
        <main className="flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-xl rounded-md border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-7 lg:flex lg:justify-end">
              <Link className="inline-block rounded focus:outline-none focus:ring-2 focus:ring-cyan-200 lg:hidden" to="/" aria-label="Go to MIPRO ERP home">
                <MiproLogo className="h-[58px] w-[228px]" priority />
              </Link>
              <Link className="mt-3 flex w-fit items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-900 lg:mt-0" to="/">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </div>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wide text-cyan-700">Secure ERP Access</p>
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
