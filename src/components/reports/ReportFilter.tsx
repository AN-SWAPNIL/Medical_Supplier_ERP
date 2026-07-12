import { CalendarDays, Filter } from "lucide-react";
import Button from "../ui/Button";

type ReportFilterProps = {
  onApply?: () => void;
};

export default function ReportFilter({ onApply }: ReportFilterProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-6">
      <label className="md:col-span-1">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-500">From</span>
        <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" type="date" defaultValue="2026-06-01" />
      </label>
      <label className="md:col-span-1">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-500">To</span>
        <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" type="date" defaultValue="2026-07-06" />
      </label>
      <label className="md:col-span-1">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Branch</span>
        <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
          <option>All Branches</option>
          <option>Dhaka Head Office</option>
          <option>Chattogram Port Desk</option>
        </select>
      </label>
      <label className="md:col-span-1">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Warehouse</span>
        <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
          <option>All Warehouses</option>
          <option>Central Medical Warehouse</option>
          <option>Chattogram Transit Store</option>
        </select>
      </label>
      <label className="md:col-span-1">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Product</span>
        <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
          <option>All Products</option>
          <option>Dialyzer</option>
          <option>Blood Tubing Set</option>
          <option>A.V Fistula Needle</option>
        </select>
      </label>
      <div className="flex items-end gap-2">
        <Button className="w-full" variant="primary" icon={<Filter className="h-4 w-4" />} onClick={onApply}>
          Apply
        </Button>
        <Button icon={<CalendarDays className="h-4 w-4" />} onClick={() => window.print()} aria-label="Print" />
      </div>
    </div>
  );
}
