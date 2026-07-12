import type { EntityRecord } from "../../types";

type PrintLayoutProps = {
  title: string;
  subtitle: string;
  record: EntityRecord;
};

function humanize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function PrintLayout({ title, subtitle, record }: PrintLayoutProps) {
  return (
    <div className="print-sheet rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Mipro HealthCare Corp.</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <strong className="block text-slate-950">ERP Print Preview</strong>
          Dhaka, Bangladesh
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {Object.entries(record)
          .filter(([key]) => !["id", "ownerId"].includes(key))
          .map(([key, value]) => (
            <div className="rounded-lg border border-slate-200 p-3" key={key}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{humanize(key)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{Array.isArray(value) ? value.join(", ") : String(value ?? "-")}</p>
            </div>
          ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-8 text-center text-sm text-slate-600">
        <div className="border-t border-slate-300 pt-3">Prepared By</div>
        <div className="border-t border-slate-300 pt-3">Authorized Signature</div>
      </div>
    </div>
  );
}
