import clsx from "clsx";
import type { ComponentType } from "react";
import { formatCurrency, formatNumber } from "../../utils/format";

type StatCardProps = {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;
  icon: ComponentType<{ className?: string }>;
  tone?: "blue" | "teal" | "green" | "amber" | "rose";
};

const toneClass = {
  blue: "border-blue-500 bg-blue-50 text-blue-700",
  teal: "border-teal-500 bg-teal-50 text-teal-700",
  green: "border-emerald-500 bg-emerald-50 text-emerald-700",
  amber: "border-amber-500 bg-amber-50 text-amber-700",
  rose: "border-rose-500 bg-rose-50 text-rose-700"
};

export default function StatCard({ label, value, unit, trend, icon: Icon, tone = "blue" }: StatCardProps) {
  const displayValue =
    typeof value === "number" ? (unit === "BDT" ? formatCurrency(value, value > 999999) : formatNumber(value)) : value;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <strong className="text-2xl font-bold tracking-tight text-slate-950">{displayValue}</strong>
            {unit && unit !== "BDT" ? <span className="text-xs font-semibold text-slate-400">{unit}</span> : null}
          </div>
        </div>
        <span className={clsx("grid h-10 w-10 place-items-center rounded-lg border-l-4", toneClass[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {typeof trend === "number" ? (
        <p className={clsx("mt-3 text-xs font-semibold", trend >= 0 ? "text-emerald-600" : "text-rose-600")}>
          {trend >= 0 ? "+" : ""}
          {trend}% vs last period
        </p>
      ) : null}
    </div>
  );
}
