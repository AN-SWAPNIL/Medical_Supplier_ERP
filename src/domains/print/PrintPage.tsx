import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import { ErrorBlock, LoadingBlock, Segmented, TableFrame } from "../components";
import { importService, printService, salesService } from "../services";
import type { Collection, Delivery, ImportCase, Quotation, SalesOrder } from "../erp.types";
import { formatCurrency, formatNumber } from "../../utils/format";

type LetterheadMode = "digital" | "preprinted";
type Printable = Quotation | SalesOrder | Delivery | Collection | ImportCase;

export default function PrintPage() {
  const { documentType = "", id = "" } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LetterheadMode>("digital");
  const configQuery = useQuery({ queryKey: ["print", "configuration"], queryFn: printService.configuration });
  const recordQuery = useQuery({
    queryKey: ["print", documentType, id],
    queryFn: async (): Promise<Printable> => {
      if (documentType === "quotation") {
        const rows = await salesService.quotations();
        const record = rows.find((row) => row.id === id);
        if (record) return record;
      }
      if (documentType === "order") {
        const rows = await salesService.orders();
        const record = rows.find((row) => row.id === id);
        if (record) return record;
      }
      if (documentType === "challan") {
        const rows = await salesService.deliveries();
        const record = rows.find((row) => row.id === id);
        if (record) return record;
      }
      if (documentType === "receipt") {
        const rows = await salesService.collections();
        const record = rows.find((row) => row.id === id);
        if (record) return record;
      }
      if (documentType === "import-cost") return importService.get(id);
      throw new Error("Printable record not found or unavailable for this role.");
    }
  });

  if (configQuery.isLoading || recordQuery.isLoading) return <LoadingBlock label="Preparing print view" />;
  if (configQuery.isError || recordQuery.isError || !recordQuery.data || !configQuery.data) return <ErrorBlock error={configQuery.error ?? recordQuery.error} />;
  const config = configQuery.data;
  const record = recordQuery.data;
  const title = documentType === "quotation" ? "QUOTATION" : documentType === "order" ? "SALES ORDER" : documentType === "challan" ? "DELIVERY CHALLAN" : documentType === "receipt" ? "MONEY RECEIPT" : "IMPORT LANDED COST";

  return (
    <>
      <div className="no-print flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>Back</Button>
        {documentType === "quotation" ? <Segmented value={mode} onChange={setMode} ariaLabel="Letterhead mode" options={[{ value: "digital", label: "Digital Letterhead" }, { value: "preprinted", label: "Preprinted Paper" }]} /> : null}
        <Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print / Save PDF</Button>
      </div>

      <article className={"print-sheet mx-auto min-h-[1120px] w-full max-w-[900px] bg-white px-4 pb-10 shadow-lg sm:px-14 " + (mode === "preprinted" && documentType === "quotation" ? "pt-52" : "pt-10")}>
        {mode === "digital" || documentType !== "quotation" ? (
          <header className="flex flex-col items-start gap-4 border-b-2 border-red-700 pb-5 sm:flex-row sm:justify-between sm:gap-6">
            <img className="h-16 max-w-52 object-contain object-left" src={config.logoUrl} alt={config.companyName} />
            <div className="max-w-full break-words text-left text-xs leading-5 text-slate-600 sm:text-right"><strong className="block text-base text-slate-950">{config.companyName}</strong><span className="block">{config.address}</span><span className="block">{config.phone} · {config.email}</span><span className="block">{config.website}</span></div>
          </header>
        ) : null}

        <div className="mt-8 flex items-start justify-between gap-6">
          <div><h1 className="text-2xl font-bold text-slate-950">{title}</h1><div className="mt-1 h-1 w-16 bg-red-700" /></div>
          <DocumentReference type={documentType} record={record} />
        </div>

        <div className="mt-8">
          {documentType === "quotation" ? <QuotationDocument record={record as Quotation} /> : null}
          {documentType === "order" ? <OrderDocument record={record as SalesOrder} /> : null}
          {documentType === "challan" ? <ChallanDocument record={record as Delivery} /> : null}
          {documentType === "receipt" ? <ReceiptDocument record={record as Collection} /> : null}
          {documentType === "import-cost" ? <ImportCostDocument record={record as ImportCase} /> : null}
        </div>

        <footer className="mt-16 grid grid-cols-2 gap-16 text-xs text-slate-500"><div className="border-t border-slate-400 pt-2">Received / Accepted By</div><div className="border-t border-slate-400 pt-2 text-right">{config.authorizedSignatory}</div></footer>
        <div className="mt-10 border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400">{config.footerText}</div>
      </article>
    </>
  );
}

function DocumentReference({ type, record }: { type: string; record: Printable }) {
  let reference = "";
  let date = "";
  if (type === "quotation") { reference = (record as Quotation).quotationNumber; date = (record as Quotation).date; }
  if (type === "order") { reference = (record as SalesOrder).orderNumber; date = (record as SalesOrder).date; }
  if (type === "challan") { reference = (record as Delivery).challanNumber; date = (record as Delivery).date; }
  if (type === "receipt") { reference = (record as Collection).receiptNumber; date = (record as Collection).date; }
  if (type === "import-cost") { reference = (record as ImportCase).primaryReference; date = (record as ImportCase).snapshot?.finalizedAt.slice(0, 10) ?? ""; }
  return <dl className="grid gap-1 text-right text-xs"><div><dt className="inline text-slate-500">Reference: </dt><dd className="inline font-bold text-slate-900">{reference}</dd></div><div><dt className="inline text-slate-500">Date: </dt><dd className="inline font-bold text-slate-900">{date}</dd></div></dl>;
}

function CustomerBlock({ name, terms }: { name: string; terms?: string }) {
  return <div className="mb-6 rounded border border-slate-200 p-4"><span className="text-[10px] font-bold uppercase text-slate-400">Prepared For</span><strong className="mt-1 block text-base">{name}</strong>{terms ? <span className="text-xs text-slate-500">Terms: {terms}</span> : null}</div>;
}

function LinesTable({ lines, showBatch = false }: { lines: Array<{ id: string; productCode: string; productName: string; quantity: string; unitPrice: string; discount: string; lineTotal: string; batchNumber?: string }>; showBatch?: boolean }) {
  return <><div className="grid gap-2 sm:hidden">{lines.map((line, index) => <article className="rounded border border-slate-200 p-3 text-xs" key={line.id}><div className="flex items-start justify-between gap-3"><div><span className="text-slate-400">#{index + 1}</span><strong className="ml-2">{line.productName}</strong><span className="ml-2 text-slate-500">{line.productCode}</span></div><strong className="shrink-0">{formatCurrency(line.lineTotal)}</strong></div><dl className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2"><div><dt className="text-slate-500">Quantity</dt><dd className="font-semibold">{formatNumber(line.quantity)}</dd></div><div><dt className="text-slate-500">Unit price</dt><dd className="font-semibold">{formatCurrency(line.unitPrice)}</dd></div><div><dt className="text-slate-500">Discount</dt><dd className="font-semibold">{formatCurrency(line.discount)}</dd></div>{showBatch ? <div><dt className="text-slate-500">Batch</dt><dd className="font-semibold">{line.batchNumber}</dd></div> : null}</dl></article>)}</div><div className="hidden sm:block"><TableFrame><table className="min-w-full border-collapse text-xs"><thead><tr className="bg-slate-900 text-white"><th className="px-3 py-2 text-left">#</th><th className="px-3 py-2 text-left">Product</th>{showBatch ? <th className="px-3 py-2 text-left">Batch</th> : null}<th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Unit Price</th><th className="px-3 py-2 text-right">Discount</th><th className="px-3 py-2 text-right">Amount</th></tr></thead><tbody>{lines.map((line, index) => <tr className="border-b border-slate-200" key={line.id}><td className="px-3 py-3">{index + 1}</td><td className="px-3 py-3"><strong className="block">{line.productName}</strong><span className="text-slate-500">{line.productCode}</span></td>{showBatch ? <td className="px-3 py-3">{line.batchNumber}</td> : null}<td className="px-3 py-3 text-right">{formatNumber(line.quantity)}</td><td className="px-3 py-3 text-right">{formatCurrency(line.unitPrice)}</td><td className="px-3 py-3 text-right">{formatCurrency(line.discount)}</td><td className="px-3 py-3 text-right font-bold">{formatCurrency(line.lineTotal)}</td></tr>)}</tbody></table></TableFrame></div></>;
}

function Totals({ subtotal, discount, total }: { subtotal: string; discount: string; total: string }) {
  return <dl className="ml-auto mt-5 grid w-72 gap-2 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div><div className="flex justify-between"><dt>Discount</dt><dd>{formatCurrency(discount)}</dd></div><div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-bold"><dt>Total</dt><dd>{formatCurrency(total)}</dd></div></dl>;
}

function QuotationDocument({ record }: { record: Quotation }) {
  return <><CustomerBlock name={record.customerName} terms={record.paymentTerms} /><LinesTable lines={record.lines} /><Totals subtotal={record.subtotal} discount={record.discountTotal} total={record.total} /><div className="mt-8 grid gap-2 text-xs text-slate-600"><p><strong>Validity:</strong> {record.validityDays} days from quotation date</p><p><strong>Remarks:</strong> {record.remarks ?? "-"}</p></div></>;
}

function OrderDocument({ record }: { record: SalesOrder }) {
  const discount = record.lines.reduce((sum, line) => sum + Number(line.discount), 0).toFixed(2);
  const subtotal = record.lines.reduce((sum, line) => sum + Number(line.quantity) * Number(line.unitPrice), 0).toFixed(2);
  return <><CustomerBlock name={record.customerName} terms={record.paymentConditions} /><LinesTable lines={record.lines} /><Totals subtotal={subtotal} discount={discount} total={record.total} /><p className="mt-8 text-xs text-slate-600"><strong>Delivery instruction:</strong> {record.deliveryInstruction}</p></>;
}

function ChallanDocument({ record }: { record: Delivery }) {
  return <><CustomerBlock name={record.customerName} /><LinesTable lines={record.lines} showBatch /><div className="mt-8 grid gap-2 text-xs text-slate-600"><p><strong>Receiver:</strong> {record.receiverName ?? "-"}</p><p><strong>Remarks:</strong> {record.remarks || "-"}</p></div></>;
}

function ReceiptDocument({ record }: { record: Collection }) {
  return <><CustomerBlock name={record.customerName} /><div className="rounded border-2 border-slate-900 p-8 text-center"><span className="text-xs font-bold uppercase text-slate-500">Amount Received</span><strong className="mt-2 block text-4xl text-slate-950">{formatCurrency(record.amount)}</strong><span className="mt-2 block text-sm text-slate-600">via {record.paymentMode}</span></div><dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-slate-500">Order Reference</dt><dd className="font-semibold">{record.orderId ?? "Customer ledger"}</dd></div><div><dt className="text-xs text-slate-500">Payment Reference</dt><dd className="font-semibold">{record.referenceNumber ?? "-"}</dd></div><div className="sm:col-span-2"><dt className="text-xs text-slate-500">Remarks</dt><dd className="font-semibold">{record.remarks ?? "-"}</dd></div></dl></>;
}

function ImportCostDocument({ record }: { record: ImportCase }) {
  const snapshot = record.snapshot;
  if (!snapshot) return <p className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">No finalized landed-cost snapshot is available.</p>;
  return <><div className="mb-6 grid gap-3 sm:grid-cols-3"><div><span className="text-xs text-slate-500">Supplier</span><strong className="block">{record.supplierName}</strong></div><div><span className="text-xs text-slate-500">PO / PI</span><strong className="block">{record.poNumber} / {record.piNumber}</strong></div><div><span className="text-xs text-slate-500">Snapshot</span><strong className="block">Version {snapshot.version} · Immutable</strong></div></div><TableFrame><table className="min-w-full text-xs"><thead><tr className="bg-slate-900 text-white"><th className="px-3 py-2 text-left">Product</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">FOB / unit</th><th className="px-3 py-2 text-right">Import cost / unit</th><th className="px-3 py-2 text-right">Landed / unit</th><th className="px-3 py-2 text-right">Total</th></tr></thead><tbody>{snapshot.products.map((product) => <tr className="border-b border-slate-200" key={product.importItemId}><td className="px-3 py-3"><strong>{product.productName}</strong><span className="block text-slate-500">{product.productCode}</span></td><td className="px-3 py-3 text-right">{formatNumber(product.quantity)}</td><td className="px-3 py-3 text-right">{formatCurrency(product.fobPerUnitBdt)}</td><td className="px-3 py-3 text-right">{formatCurrency(product.additionalPerUnitBdt)}</td><td className="px-3 py-3 text-right font-bold">{formatCurrency(product.finalPerUnitBdt)}</td><td className="px-3 py-3 text-right font-bold">{formatCurrency(product.finalTotalBdt)}</td></tr>)}</tbody></table></TableFrame><Totals subtotal={snapshot.totalProductValueBdt} discount="0" total={snapshot.totalShipmentCostBdt} /><p className="mt-6 text-xs text-slate-500">Additional allocated import cost: {formatCurrency(snapshot.totalAdditionalCostBdt)}. Customs duty values are final assessed product amounts, not ERP-generated tax formulas.</p></>;
}
