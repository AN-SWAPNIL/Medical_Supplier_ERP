import clsx from "clsx";

type StatusBadgeProps = {
  status?: string;
};

const toneByStatus: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Approved: "bg-blue-50 text-blue-700 ring-blue-200",
  Posted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Ready: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Normal: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Open: "bg-blue-50 text-blue-700 ring-blue-200",
  Shipped: "bg-blue-50 text-blue-700 ring-blue-200",
  Customs: "bg-amber-50 text-amber-700 ring-amber-200",
  Draft: "bg-slate-50 text-slate-600 ring-slate-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  "Pending Approval": "bg-amber-50 text-amber-700 ring-amber-200",
  Attention: "bg-orange-50 text-orange-700 ring-orange-200",
  Due: "bg-orange-50 text-orange-700 ring-orange-200",
  "6 Month Alert": "bg-amber-50 text-amber-700 ring-amber-200",
  "3 Month Alert": "bg-orange-50 text-orange-700 ring-orange-200",
  "1 Month Alert": "bg-rose-50 text-rose-700 ring-rose-200",
  Expired: "bg-rose-50 text-rose-700 ring-rose-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  Inactive: "bg-slate-100 text-slate-500 ring-slate-200"
};

export default function StatusBadge({ status = "Draft" }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        toneByStatus[status] ?? "bg-slate-50 text-slate-600 ring-slate-200"
      )}
    >
      {status}
    </span>
  );
}
