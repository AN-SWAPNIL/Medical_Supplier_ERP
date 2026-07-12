import { useQuery } from "@tanstack/react-query";
import { Download, FileBarChart, Printer } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ReportFilter from "../../components/reports/ReportFilter";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { apiClient } from "../../lib/api/client";
import { useToastStore } from "../../lib/ui/toast";
import { formatCurrency } from "../../utils/format";

const reportGroups = [
  ["Daily", "Sales by rep and product", "Collection report", "Stock movement report"],
  ["Weekly", "Sales summary by territory", "Expense summary", "Collection vs target"],
  ["Monthly", "Profit & loss", "Balance sheet", "Cash flow", "Inventory valuation"],
  ["Operational", "Import pipeline", "Landed cost", "Expiry alert", "Batch traceability", "Transport cost"]
];

export default function ReportsCenterPage() {
  const pushToast = useToastStore((state) => state.push);
  const query = useQuery({
    queryKey: ["reports"],
    queryFn: async () => (await apiClient.reports()).data
  });
  const rows = query.data ?? [];
  const financialPreviews = [
    { title: "Profit & Loss", primary: "BDT 345,200", caption: "Net profit snapshot from workbook seed data", lines: ["Sales revenue BDT 3,970,000", "COGS BDT 2,888,350", "Gross profit BDT 1,081,650"] },
    { title: "Balance Sheet", primary: "BDT 1,286,145", caption: "Inventory asset value currently in stock", lines: ["Receivables BDT 1,770,000", "Payables BDT 2,435,000", "Bank BDT 22,750,000"] },
    { title: "Cash Flow", primary: "BDT 1,850,000", caption: "Collection entries posted/pending", lines: ["Receipt MR-2026-001", "Cheque collection pending", "Bank reconciliation ready"] },
    { title: "Operational Trace", primary: "17,500 units", caption: "Stock with batch/LOT/expiry traceability", lines: ["PO-2026-001", "CN-9982 / LC-77612", "FEFO alerts active"] }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Reports & Decision Intelligence"
        subtitle="Filter, chart, export and print daily, weekly, monthly and operational reports with drill-down-ready mock data."
        actions={
          <>
            <Button icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ kind: "success", title: "CSV export prepared" })}>
              Export CSV
            </Button>
            <Button icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
              Print
            </Button>
          </>
        }
      />
      <ReportFilter onApply={() => pushToast({ kind: "info", title: "Filters applied" })} />
      <div className="grid gap-4 xl:grid-cols-4">
        {reportGroups.map(([group, ...reports]) => (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={group}>
            <div className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-teal-700" />
              <h2 className="font-bold text-slate-950">{group} Reports</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {reports.map((report) => (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm" key={report}>
                  <span className="font-medium text-slate-700">{report}</span>
                  <StatusBadge status="Ready" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <section className="grid gap-4 xl:grid-cols-4">
        {financialPreviews.map((preview) => (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={preview.title}>
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{preview.title}</p>
            <strong className="mt-2 block text-2xl text-slate-950">{preview.primary}</strong>
            <p className="mt-1 min-h-10 text-sm text-slate-500">{preview.caption}</p>
            <div className="mt-4 grid gap-2">
              {preview.lines.map((line) => (
                <span className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700" key={line}>
                  {line}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Sales, Collection & Inventory Snapshot</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="sales" fill="#0f766e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="collection" fill="#2563eb" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Drill-down Table</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Report", "Sales", "Collection", "Expense", "Status"].map((head) => (
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500" key={head}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-3 font-semibold text-slate-900">{String(row.label)}</td>
                    <td className="px-3 py-3">{formatCurrency(Number(row.sales ?? 0))}</td>
                    <td className="px-3 py-3">{formatCurrency(Number(row.collection ?? 0))}</td>
                    <td className="px-3 py-3">{formatCurrency(Number(row.expense ?? 0))}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={String(row.status ?? "Ready")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
