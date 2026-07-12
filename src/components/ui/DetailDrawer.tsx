import { X } from "lucide-react";
import type { ReactNode } from "react";
import StatusBadge from "./StatusBadge";
import { useEffectiveRole } from "../../lib/auth/session";
import { detailKeysForRole, redactedFieldNotice } from "../../lib/permissions/dataVisibility";
import type { EntityRecord } from "../../types";

type DetailDrawerProps = {
  open: boolean;
  title: string;
  record: EntityRecord | null;
  onClose: () => void;
  children?: ReactNode;
};

function humanize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function DetailDrawer({ open, title, record, onClose, children }: DetailDrawerProps) {
  const role = useEffectiveRole();

  if (!open || !record) {
    return null;
  }

  const notice = redactedFieldNotice(role);
  const detailKeys = detailKeysForRole(record, role);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/30">
      <aside className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Record Details</p>
            <h2 className="text-xl font-bold text-slate-950">{title}</h2>
          </div>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {notice ? (
          <div className="mx-5 mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            {notice}
          </div>
        ) : null}
        <dl className="grid gap-3 p-5">
          {detailKeys
            .map((key) => [key, record[key]] as const)
            .map(([key, value]) => (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={key}>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{humanize(key)}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {key === "status" ? <StatusBadge status={String(value ?? "")} /> : Array.isArray(value) ? value.join(", ") : String(value ?? "-")}
                </dd>
              </div>
            ))}
        </dl>
        {children ? <div className="grid gap-4 border-t border-slate-200 bg-slate-50 p-5">{children}</div> : null}
      </aside>
    </div>
  );
}
