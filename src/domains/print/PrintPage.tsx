import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer, Ruler, Stamp } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useAuthStore, useEffectiveRole } from "../../lib/auth/session";
import type { Role, User } from "../../types";
import { ErrorBlock, LoadingBlock, Segmented } from "../components";
import { importService, marketingService, printService, reportService, salesService, settingsService } from "../services";
import type {
  AuditEvent,
  Collection,
  Delivery,
  EmployeeMarketingSnapshot,
  ImportCase,
  MarketingReportData,
  PrintIdentity,
  Quotation,
  ReportData,
  SalesOrder,
  SalespersonPerformanceData,
  SalespersonPerformanceDetail
} from "../erp.types";
import { formatCurrency, formatNumber } from "../../utils/format";
import {
  employeeReportTitle,
  filterEmployeeReportActivities,
  type EmployeeReportFrequency,
  type EmployeeReportKind
} from "../employees/employeeReports";
import { LetterheadSheet, letterheadModeOptions, printModeFromConfiguration, type LetterheadMode } from "./LetterheadPrint";
import {
  auditEventsReportTable,
  buildEmployeeLetterheadPages,
  buildMarketingLetterheadPages,
  buildOperationalLetterheadPages,
  buildPerformancePrintTables
} from "./ReportPrintContent";

type PrintPayload =
  | { kind: "quotation"; record: Quotation }
  | { kind: "order"; record: SalesOrder }
  | { kind: "challan"; record: Delivery }
  | { kind: "receipt"; record: Collection }
  | { kind: "import-cost"; record: ImportCase }
  | { kind: "employee-performance"; record: SalespersonPerformanceDetail }
  | { kind: "employee-activity"; snapshot: EmployeeMarketingSnapshot }
  | { kind: "marketing-analysis"; report: MarketingReportData }
  | { kind: "operational-report"; report: ReportData; performance?: SalespersonPerformanceData; audit: AuditEvent[] };

type PrintPresentation = {
  title: string;
  subtitle?: string;
  reference: string;
  date: string;
  content: ReactNode;
  pages?: ReactNode[];
};

export default function PrintPage() {
  const { documentType = "", id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.session?.user);
  const role = useEffectiveRole();
  const [mode, setMode] = useState<LetterheadMode | "">("");
  const [identityId, setIdentityId] = useState("");
  const queryString = searchParams.toString();
  const configQuery = useQuery({ queryKey: ["print", "configuration"], queryFn: printService.configuration });
  const recordQuery = useQuery({
    queryKey: ["print", documentType, id, queryString, user?.id],
    queryFn: async (): Promise<PrintPayload> => {
      if (documentType === "quotation") return { kind: "quotation", record: find(await salesService.quotations(), id) };
      if (documentType === "order") return { kind: "order", record: find(await salesService.orders(), id) };
      if (documentType === "challan") return { kind: "challan", record: find(await salesService.deliveries(), id) };
      if (documentType === "receipt") return { kind: "receipt", record: find(await salesService.collections(), id) };
      if (documentType === "import-cost") return { kind: "import-cost", record: await importService.get(id) };
      if (documentType === "employee-performance") {
        const today = new Date().toISOString().slice(0, 10);
        const report = await reportService.salespeople(searchParams.get("from") ?? `${today.slice(0, 7)}-01`, searchParams.get("to") ?? today, id);
        if (!report.selected) throw new Error("Select one employee before opening the printable report.");
        return { kind: "employee-performance", record: report.selected };
      }
      if (documentType === "employee-activity") {
        const { from, to } = requiredPeriod(searchParams);
        return { kind: "employee-activity", snapshot: await marketingService.employeeSnapshot(id, from, to) };
      }
      if (documentType === "marketing-analysis") {
        const { from, to } = requiredPeriod(searchParams);
        const report = await reportService.marketing({
          from,
          to,
          employeeId: searchParams.get("employeeId") ?? "all",
          territory: searchParams.get("territory") ?? "",
          activityType: searchParams.get("activityType") ?? "",
          subjectId: searchParams.get("subjectId") ?? "",
          verification: searchParams.get("verification") ?? "",
          status: searchParams.get("status") ?? "",
          groupBy: searchParams.get("groupBy") ?? "Date",
          mode: searchParams.get("mode") === "Detail" ? "Detail" : "Summary"
        });
        return { kind: "marketing-analysis", report };
      }
      if (documentType === "operational-report") {
        const { from, to } = requiredPeriod(searchParams);
        const table = searchParams.get("table") ?? "";
        const [report, performance, audit] = await Promise.all([
          reportService.get(from, to),
          table === "salesperson-performance" ? reportService.salespeople(from, to, searchParams.get("employeeId") ?? "all") : Promise.resolve(undefined),
          (searchParams.get("view") ?? id) === "audit" ? settingsService.audit() : Promise.resolve([])
        ]);
        return { kind: "operational-report", report, performance, audit };
      }
      throw new Error("Printable record not found or unavailable for this role.");
    }
  });

  if (configQuery.isLoading || recordQuery.isLoading) return <LoadingBlock label="Preparing calibrated A4 print view" />;
  if (configQuery.isError || recordQuery.isError || !recordQuery.data || !configQuery.data || !user) return <ErrorBlock error={configQuery.error ?? recordQuery.error ?? new Error("Your session is unavailable. Sign in again before printing.")} />;
  const config = configQuery.data;
  const payload = recordQuery.data;
  const identity = config.identities.find((entry) => entry.id === (identityId || config.defaultIdentityId)) ?? config.identities[0];
  const effectiveMode = printModeFromConfiguration(config, mode);
  const presentation = buildPresentation(payload, searchParams, user, role, identity);

  return (
    <>
      <div className="no-print flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
        <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>Back</Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600"><Stamp className="h-4 w-4" /><select aria-label="Print identity" className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm" value={identity.id} onChange={(event) => setIdentityId(event.target.value)}>{config.identities.map((entry) => <option value={entry.id} key={entry.id}>{entry.displayName}</option>)}</select></label>
          <Segmented value={effectiveMode} onChange={setMode} ariaLabel="Letterhead artwork" options={letterheadModeOptions} />
        </div>
        <Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print / Save PDF</Button>
      </div>

      <div className="print-preview grid gap-4 overflow-x-auto rounded-md bg-slate-200 p-3 sm:p-6">
        {(presentation.pages ?? [presentation.content]).map((page, index, pages) => <LetterheadSheet
          identity={identity}
          mode={effectiveMode}
          title={presentation.title}
          subtitle={`${presentation.subtitle ?? ""}${pages.length > 1 ? `${presentation.subtitle ? " | " : ""}Page ${index + 1} of ${pages.length}` : ""}` || undefined}
          reference={presentation.reference}
          date={presentation.date}
          className="print-sheet shadow-xl"
          key={index}
        >
          {page}
        </LetterheadSheet>)}
      </div>
      <div className="no-print flex items-start gap-2 rounded-md border border-cyan-200 bg-cyan-50 p-3 text-xs leading-5 text-cyan-900"><Ruler className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Physical calibration:</strong> 210 x 297 mm, zero browser margin, content safe area {identity.safeArea.topMm}/{identity.safeArea.rightMm}/{identity.safeArea.bottomMm}/{identity.safeArea.leftMm} mm. Choose "Actual size / 100%" in the print dialog.</p></div>
    </>
  );
}

function find<T extends { id: string }>(rows: T[], id: string) {
  const record = rows.find((row) => row.id === id);
  if (!record) throw new Error("Printable record not found or unavailable for this role.");
  return record;
}

function requiredPeriod(params: URLSearchParams) {
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) throw new Error("A valid report period is required for print preview.");
  return { from, to };
}

function buildPresentation(payload: PrintPayload, params: URLSearchParams, user: User, role: Role, identity: PrintIdentity): PrintPresentation {
  if (payload.kind === "quotation") return { title: "QUOTATION", reference: payload.record.quotationNumber, date: payload.record.date, content: <QuotationDocument record={payload.record} /> };
  if (payload.kind === "order") return { title: "ORDER RECEIVING SHEET", reference: payload.record.orderNumber, date: payload.record.date, content: <OrderReceivingSheet record={payload.record} identity={identity} /> };
  if (payload.kind === "challan") return { title: "DELIVERY CHALLAN", reference: payload.record.challanNumber, date: payload.record.date, content: <ChallanDocument record={payload.record} /> };
  if (payload.kind === "receipt") return { title: "MONEY RECEIPT", reference: payload.record.receiptNumber, date: payload.record.date, content: <ReceiptDocument record={payload.record} /> };
  if (payload.kind === "import-cost") return { title: "IMPORT LANDED COST", reference: payload.record.primaryReference, date: payload.record.snapshot?.finalizedAt.slice(0, 10) ?? "", content: <ImportCostDocument record={payload.record} /> };
  if (payload.kind === "employee-performance") return { title: "SALES EMPLOYEE PERFORMANCE REPORT", reference: payload.record.employee.name, date: "Selected period", content: <EmployeePerformanceDocument record={payload.record} from={params.get("from") ?? ""} to={params.get("to") ?? ""} /> };

  const { from, to } = requiredPeriod(params);
  if (payload.kind === "employee-activity") {
    const frequency = employeeFrequency(params.get("frequency"));
    const reportKind = employeeKind(params.get("reportKind"));
    const activities = filterEmployeeReportActivities(payload.snapshot.recentActivities, reportKind);
    const showTargets = reportKind === "Complete" || reportKind === "Sales & Collection";
    const showPlans = reportKind === "Complete" || reportKind === "Activity" || reportKind === "Field Work";
    const showFollowUps = reportKind === "Complete" || reportKind === "Follow-ups";
    const showPipeline = reportKind === "Complete" || reportKind === "Follow-ups";
    const periodText = from === to ? from : `${from} to ${to}`;
    return {
      title: employeeReportTitle(reportKind, frequency).toUpperCase(),
      subtitle: "Employee performance and activity recorded through the linked ERP user ID",
      reference: `EMP-${payload.snapshot.employee.employeeCode}-${to.replaceAll("-", "")}-${frequency.slice(0, 1).toUpperCase()}`,
      date: periodText,
      content: null,
      pages: buildEmployeeLetterheadPages({ snapshot: payload.snapshot, actor: user, activities, periodText, reportKind, showTargets, showPlans, showFollowUps, showPipeline })
    };
  }

  if (payload.kind === "marketing-analysis") {
    const table = payload.report.tables.find((entry) => entry.id === params.get("table")) ?? payload.report.tables[0];
    if (!table) throw new Error("No marketing report table is available for this preview.");
    const employee = payload.report.performance.find((entry) => entry.employee.id === payload.report.filters.employeeId)?.employee.name;
    return {
      title: "MARKETING TEAM ANALYSIS",
      subtitle: `${table.title} | ${payload.report.filters.mode} | Grouped by ${payload.report.filters.groupBy}${employee ? ` | ${employee}` : ""}`,
      reference: `MKT-${table.id.toUpperCase()}-${to.replaceAll("-", "")}`,
      date: `${from} to ${to}`,
      content: null,
      pages: buildMarketingLetterheadPages({ summary: payload.report.summary, table })
    };
  }

  const view = params.get("view") ?? "overview";
  const tableId = params.get("table") ?? "";
  const groups = [
    { id: "imports", title: "Import & Cost", rows: payload.report.importCosts, tables: payload.report.tables.imports },
    { id: "inventory", title: "Inventory", rows: payload.report.inventory, tables: payload.report.tables.inventory },
    { id: "sales", title: "Sales & Collection", rows: payload.report.sales, tables: payload.report.tables.sales },
    { id: "expenses", title: "Expense & Cash-Bank", rows: payload.report.expenses, tables: payload.report.tables.expenses }
  ].filter((group) => role !== "Sales Executive" || group.id === "sales");
  const selectedGroup = groups.find((group) => group.id === view);
  const taDaEmployee = params.get("taDaEmployee") ?? "All employees";
  const selectedTable = selectedGroup?.tables.find((table) => table.id === tableId) ?? selectedGroup?.tables[0];
  const filteredTable = selectedTable?.id === "ta-da" && taDaEmployee !== "All employees" ? { ...selectedTable, rows: selectedTable.rows.filter((row) => row.employee === taDaEmployee) } : selectedTable;
  const auditTable = auditEventsReportTable(payload.audit);
  const tables = view === "overview"
    ? groups.flatMap((group) => group.tables)
    : view === "audit"
      ? [auditTable]
      : tableId === "salesperson-performance"
        ? buildPerformancePrintTables(payload.performance)
        : filteredTable ? [filteredTable] : [];
  const summary = view === "overview"
    ? groups.flatMap((group) => group.rows.slice(0, 2).map((row) => ({ label: `${group.title}: ${row.label}`, value: row.value })))
    : selectedGroup?.rows ?? (view === "audit" ? [{ label: "Protected events", value: String(auditTable.rows.length) }] : []);
  const title = view === "overview"
    ? "OPERATIONAL REPORT OVERVIEW"
    : view === "audit"
      ? "NARROW AUDIT REPORT"
      : tableId === "salesperson-performance"
        ? role === "Sales Executive" ? "MY SALES PERFORMANCE" : "SALES TEAM COMPARISON"
        : (filteredTable?.title ?? selectedGroup?.title ?? "OPERATIONAL REPORT").toUpperCase();
  return {
    title,
    subtitle: `${role} role-safe report | Main Warehouse${filteredTable?.id === "ta-da" ? ` | Employee: ${taDaEmployee}` : ""}`,
    reference: `RPT-${view.toUpperCase()}-${to.replaceAll("-", "")}`,
    date: `${from} to ${to}`,
    content: null,
    pages: buildOperationalLetterheadPages({ summary, tables })
  };
}

function employeeFrequency(value: string | null): EmployeeReportFrequency {
  return value === "Weekly" || value === "Monthly" || value === "Custom" ? value : "Daily";
}

function employeeKind(value: string | null): EmployeeReportKind {
  return value === "Activity" || value === "Field Work" || value === "Sales & Collection" || value === "Follow-ups" ? value : "Complete";
}

function CustomerBlock({ name, address, phone, contact, terms }: { name: string; address?: string; phone?: string; contact?: string; terms?: string }) {
  return <div className="mb-4 border border-slate-300 bg-white/90 p-3"><span className="text-[8px] font-bold uppercase text-blue-700">Prepared For</span><strong className="mt-1 block text-[13px]">{name}</strong>{address ? <span className="block text-[10px] text-slate-600">{address}</span> : null}<span className="block text-[10px] text-slate-600">{[contact, phone].filter(Boolean).join(" | ")}</span>{terms ? <span className="mt-1 block text-[10px] text-slate-600"><b>Terms:</b> {terms}</span> : null}</div>;
}

type PrintableLine = { id: string; productCode: string; productName: string; quantity: string; unitPrice: string; discount: string; lineTotal: string; batchNumber?: string };

function LinesTable({ lines, showBatch = false, simple = false }: { lines: PrintableLine[]; showBatch?: boolean; simple?: boolean }) {
  return <table className="w-full table-fixed border-collapse text-[9px]"><thead><tr className="bg-blue-950 text-white"><th className="w-7 border border-blue-950 px-2 py-2 text-left">#</th><th className="border border-blue-950 px-2 py-2 text-left">Particulars</th>{showBatch ? <th className="w-24 border border-blue-950 px-2 py-2 text-left">Batch</th> : null}<th className="w-20 border border-blue-950 px-2 py-2 text-right">Qty in Pcs</th><th className="w-24 border border-blue-950 px-2 py-2 text-right">Unit Price</th>{!simple ? <th className="w-20 border border-blue-950 px-2 py-2 text-right">Discount</th> : null}<th className="w-24 border border-blue-950 px-2 py-2 text-right">Total Value</th></tr></thead><tbody>{lines.map((line, index) => <tr key={`${line.id}-${line.batchNumber ?? "line"}`}><td className="border border-slate-400 px-2 py-2">{index + 1}</td><td className="border border-slate-400 px-2 py-2"><strong>{line.productName}</strong><span className="ml-2 text-slate-500">{line.productCode}</span></td>{showBatch ? <td className="border border-slate-400 px-2 py-2">{line.batchNumber}</td> : null}<td className="border border-slate-400 px-2 py-2 text-right">{formatNumber(line.quantity)}</td><td className="border border-slate-400 px-2 py-2 text-right">{formatCurrency(line.unitPrice)}</td>{!simple ? <td className="border border-slate-400 px-2 py-2 text-right">{formatCurrency(line.discount)}</td> : null}<td className="border border-slate-400 px-2 py-2 text-right font-bold">{formatCurrency(line.lineTotal)}</td></tr>)}</tbody></table>;
}

function Totals({ subtotal, discount, total }: { subtotal: string; discount: string; total: string }) {
  return <dl className="ml-auto mt-3 grid w-64 gap-1 text-[10px]"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div><div className="flex justify-between"><dt>Discount</dt><dd>{formatCurrency(discount)}</dd></div><div className="flex justify-between border-t-2 border-blue-950 pt-2 text-xs font-bold"><dt>Total</dt><dd>{formatCurrency(total)}</dd></div></dl>;
}

function QuotationDocument({ record }: { record: Quotation }) {
  return <><CustomerBlock name={record.customerName} address={record.customerAddressSnapshot} phone={record.customerPhoneSnapshot} contact={record.customerContactSnapshot} terms={record.paymentTerms} /><LinesTable lines={record.lines} /><Totals subtotal={record.subtotal} discount={record.discountTotal} total={record.total} /><div className="mt-5 grid gap-1 text-[10px] text-slate-700"><p><strong>Validity:</strong> {record.validityDays} days from quotation date</p><p><strong>Remarks:</strong> {record.remarks ?? "-"}</p></div><SignatureRow labels={["Customer Acceptance", "Head of Sales", "Authorized Signatory"]} /></>;
}

function OrderReceivingSheet({ record, identity }: { record: SalesOrder; identity: PrintIdentity }) {
  const discount = record.lines.reduce((sum, line) => sum + Number(line.discount), 0).toFixed(2);
  const subtotal = record.lines.reduce((sum, line) => sum + Number(line.quantity) * Number(line.unitPrice), 0).toFixed(2);
  return <div className="text-[10px]"><div className="mb-3 grid grid-cols-2 gap-4"><div><b className="text-blue-950">LED TRACKERS</b><strong className="block text-[12px]">MIPRO Healthcare Corporation</strong></div><div className="text-right"><b>Order No:</b> {record.orderNumber}<br /><b>Date:</b> {record.date}</div></div><LinesTable lines={record.lines} simple /><Totals subtotal={subtotal} discount={discount} total={record.total} /><section className="mt-4 border border-slate-500"><div className="min-h-14 border-b border-slate-400 p-2"><b>Customer&apos;s Address & Phone Number:</b><p className="mt-1">{record.customerName} | {record.customerAddressSnapshot ?? "-"} | {record.customerPhoneSnapshot ?? "-"}</p></div><div className="min-h-20 p-2"><b>Payment Conditions:</b><p className="mt-1 whitespace-pre-wrap">{record.paymentConditions}</p><p className="mt-3">Payment made to: <b>{identity.displayName}</b> | Ref: {record.paymentReference ?? "........................"} | Date: {record.paymentDate ?? "................"}</p></div><div className="grid grid-cols-2 border-t border-slate-400"><div className="p-2"><b>Demand Received by:</b><p>Name: {record.orderReceivedByName ?? ""}</p><p>Designation: {record.orderReceivedByDesignation ?? ""}</p></div><div className="border-l border-slate-400 p-2 text-right"><b>Order Given by: (Seal & Sign)</b><p className="mt-3">{record.orderGivenBy ?? ""}</p></div></div></section><section className="mt-4 border border-slate-500"><div className="bg-slate-800 py-1.5 text-center font-bold text-white">Office Use Only</div><div className="grid min-h-20 grid-cols-2 gap-2 p-2"><div><p>Order No.: {record.orderNumber}</p><p className="mt-2">Payment Confirmation: {record.paymentConfirmation ?? "Pending"}</p><p className="mt-2">Delivery Date: {record.requestedDeliveryDate ?? "Pending"}</p></div><div className="text-right">Date: {record.date}</div></div><div className="grid grid-cols-3 border-t border-slate-400 p-2 text-center"><span>Head of Sales<br />{record.headOfSalesSignoff ?? ""}</span><span>COE<br />{record.coeSignoff ?? ""}</span><span>Managing Director<br />{record.mdSignoff ?? ""}</span></div></section><p className="mt-3 text-[9px] text-slate-600"><b>Delivery instruction:</b> {record.deliveryInstruction}</p></div>;
}

function ChallanDocument({ record }: { record: Delivery }) {
  return <><CustomerBlock name={record.customerName} /><LinesTable lines={record.lines} showBatch simple /><div className="mt-5 grid gap-1 text-[10px] text-slate-700"><p><strong>Receiver:</strong> {record.receiverName ?? "-"}</p><p><strong>Remarks:</strong> {record.remarks || "-"}</p></div><SignatureRow labels={["Prepared By", "Receiver Seal & Signature", "Authorized By"]} /></>;
}

function ReceiptDocument({ record }: { record: Collection }) {
  return <><CustomerBlock name={record.customerName} /><div className="border-2 border-blue-950 bg-white/90 p-6 text-center"><span className="text-[9px] font-bold uppercase text-slate-500">Amount Received</span><strong className="mt-2 block text-3xl text-blue-950">{formatCurrency(record.amount)}</strong><span className="mt-2 block text-xs text-slate-600">via {record.paymentMode}</span></div><dl className="mt-5 grid gap-3 text-[10px] sm:grid-cols-2"><div><dt className="text-slate-500">Order Reference</dt><dd className="font-semibold">{record.orderId ?? "Customer ledger"}</dd></div><div><dt className="text-slate-500">Payment Reference</dt><dd className="font-semibold">{record.referenceNumber ?? "-"}</dd></div><div className="sm:col-span-2"><dt className="text-slate-500">Remarks</dt><dd className="font-semibold">{record.remarks ?? "-"}</dd></div></dl><SignatureRow labels={["Received From", "Accounts", "Authorized Signatory"]} /></>;
}

function ImportCostDocument({ record }: { record: ImportCase }) {
  const snapshot = record.snapshot;
  if (!snapshot) return <p className="border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">No finalized landed-cost snapshot is available.</p>;
  return <><div className="mb-4 grid gap-2 text-[10px] sm:grid-cols-3"><div><span className="text-slate-500">Supplier</span><strong className="block">{record.supplierName}</strong></div><div><span className="text-slate-500">PO / PI</span><strong className="block">{record.poNumber} / {record.piNumber ?? "-"}</strong></div><div><span className="text-slate-500">Snapshot</span><strong className="block">Version {snapshot.version} | Immutable</strong></div></div><table className="w-full border-collapse text-[9px]"><thead><tr className="bg-blue-950 text-white"><th className="px-2 py-2 text-left">Product</th><th className="px-2 py-2 text-right">Qty</th><th className="px-2 py-2 text-right">FOB / unit</th><th className="px-2 py-2 text-right">Import cost / unit</th><th className="px-2 py-2 text-right">Landed / unit</th><th className="px-2 py-2 text-right">Total</th></tr></thead><tbody>{snapshot.products.map((product) => <tr className="border-b border-slate-300" key={product.importItemId}><td className="px-2 py-2"><strong>{product.productName}</strong><span className="block text-slate-500">{product.productCode}</span></td><td className="px-2 py-2 text-right">{formatNumber(product.quantity)}</td><td className="px-2 py-2 text-right">{formatCurrency(product.fobPerUnitBdt)}</td><td className="px-2 py-2 text-right">{formatCurrency(product.additionalPerUnitBdt)}</td><td className="px-2 py-2 text-right font-bold">{formatCurrency(product.finalPerUnitBdt)}</td><td className="px-2 py-2 text-right font-bold">{formatCurrency(product.finalTotalBdt)}</td></tr>)}</tbody></table><Totals subtotal={snapshot.totalProductValueBdt} discount="0" total={snapshot.totalShipmentCostBdt} /><p className="mt-4 text-[9px] text-slate-600">Additional allocated import cost: {formatCurrency(snapshot.totalAdditionalCostBdt)}. Customs duty values are final assessed product amounts, not ERP-generated tax formulas.</p><SignatureRow labels={["Prepared By", "Checked By", "Authorized Owner"]} /></>;
}

function EmployeePerformanceDocument({ record, from, to }: { record: SalespersonPerformanceDetail; from: string; to: string }) {
  const summaryRows = [
    ["Quotations", String(record.summary.quotationsCreated)],
    ["Converted", String(record.summary.convertedQuotations)],
    ["Orders", String(record.summary.ordersCreated)],
    ["Delivered Sales", formatCurrency(record.summary.deliveredSalesValue)],
    ["Collections", formatCurrency(record.summary.collectionsReceived)],
    ["Outstanding Customer Due", formatCurrency(record.summary.assignedCustomerDue)],
    ["Conversion Rate", `${record.summary.conversionRate}%`]
  ];
  const sections = [record.tables.customers, record.tables.quotations, record.tables.orders, record.tables.deliveries, record.tables.collections, record.tables.products];
  return <div className="text-[9px]"><div className="grid grid-cols-2 gap-3 border border-slate-300 bg-white/90 p-3"><div><span className="text-slate-500">Employee</span><strong className="block text-[12px]">{record.employee.name}</strong><span>{record.employee.title}</span></div><div className="text-right"><span className="text-slate-500">Territory / Period</span><strong className="block">{record.employee.territory ?? "-"}</strong><span>{from} to {to}</span></div></div><h2 className="mt-4 border-b border-blue-900 pb-1 text-[10px] font-bold text-blue-950">SUMMARY</h2><div className="mt-2 grid grid-cols-4 gap-2">{summaryRows.map(([label, value]) => <div className="border border-slate-300 bg-white/90 p-2" key={label}><span className="block text-[7px] uppercase text-slate-500">{label}</span><strong className="mt-1 block text-[10px]">{value}</strong></div>)}</div>{sections.map((table) => <section className="mt-4 break-inside-avoid" key={table.id}><h2 className="border-b border-blue-900 pb-1 text-[10px] font-bold text-blue-950">{table.title.toUpperCase()}</h2><table className="mt-2 w-full border-collapse text-[8px]"><thead><tr className="bg-blue-950 text-white">{table.columns.map((column) => <th className={`border border-blue-950 px-1.5 py-1.5 ${column.align === "right" ? "text-right" : "text-left"}`} key={column.key}>{column.label}</th>)}</tr></thead><tbody>{table.rows.map((row, index) => <tr key={index}>{table.columns.map((column) => <td className={`border border-slate-300 px-1.5 py-1.5 ${column.align === "right" ? "text-right" : ""}`} key={column.key}>{/amount|value|sales|collected|due|discount/i.test(column.key) ? formatCurrency(row[column.key] ?? "0") : row[column.key] ?? "-"}</td>)}</tr>)}{!table.rows.length ? <tr><td className="border border-slate-300 p-2 text-center text-slate-500" colSpan={table.columns.length}>No activity in this period.</td></tr> : null}</tbody></table></section>)}<SignatureRow labels={["Prepared By", "Head of Sales", "Managing Director"]} /></div>;
}

function SignatureRow({ labels }: { labels: string[] }) {
  return <div className="mt-12 grid gap-8 text-[9px] text-slate-600" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>{labels.map((label) => <div className="border-t border-slate-500 pt-1 text-center" key={label}>{label}</div>)}</div>;
}
