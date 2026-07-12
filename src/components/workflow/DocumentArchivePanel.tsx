import { Archive, FileCheck2, FileText, UploadCloud } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import type { EntityRecord } from "../../types";

type DocumentArchivePanelProps = {
  record: EntityRecord;
  documents: EntityRecord[];
};

function identifiersForRecord(record: EntityRecord) {
  return Object.values(record)
    .filter((value): value is string | number => typeof value === "string" || typeof value === "number")
    .map((value) => String(value).toLowerCase())
    .filter((value) => value.length > 2);
}

export default function DocumentArchivePanel({ record, documents }: DocumentArchivePanelProps) {
  const identifiers = identifiersForRecord(record);
  const matched = documents.filter((document) => {
    const haystack = `${document.recordId ?? ""} ${document.documentName ?? ""} ${document.module ?? ""}`.toLowerCase();
    return identifiers.some((identifier) => haystack.includes(identifier));
  });
  const rows = matched.length
    ? matched
    : [
        {
          id: "doc-placeholder-1",
          documentName: "Document slot ready",
          module: "Workflow",
          fileType: "PDF / Image",
          recordId: record.id,
          status: "Pending Upload"
        }
      ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Document Archive</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">PI, PO, LC, shipment, COA, CE, ISO and invoice files</h2>
          <p className="mt-1 text-sm text-slate-500">Linked document storage is mocked here and ready for backend/Supabase storage integration.</p>
        </div>
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-teal-700 bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          type="button"
        >
          <UploadCloud className="h-4 w-4" />
          Mock Upload
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((document) => (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={String(document.id)}>
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-teal-700 shadow-sm">
                {String(document.status) === "Archived" ? <FileCheck2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </span>
              <StatusBadge status={String(document.status ?? "Pending")} />
            </div>
            <h3 className="mt-3 font-bold text-slate-950">{String(document.documentName)}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {String(document.module ?? "Module")} / {String(document.fileType ?? "File")}
            </p>
            <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">
              <Archive className="h-3.5 w-3.5" />
              Ref {String(document.recordId ?? record.id)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
