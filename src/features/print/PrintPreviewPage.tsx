import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { useParams } from "react-router-dom";
import PrintLayout from "../../components/print/PrintLayout";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { apiClient } from "../../lib/api/client";
import { getModuleConfigByKey } from "../modules/moduleConfigs";

const templateTitles: Record<string, string> = {
  quotation: "Quotation",
  "purchase-order": "Purchase Order",
  challan: "Delivery Challan",
  invoice: "Sales Invoice",
  receipt: "Money Receipt",
  grn: "Goods Receiving Note",
  payslip: "Payslip",
  report: "Report Print View"
};

export default function PrintPreviewPage() {
  const { template = "report", moduleKey = "", id = "" } = useParams();
  const config = getModuleConfigByKey(moduleKey);
  const query = useQuery({
    queryKey: ["print", moduleKey, id],
    enabled: Boolean(config && id),
    queryFn: async () => (await apiClient.detail(config?.endpoint ?? "", id)).data
  });

  const record = query.data;

  return (
    <>
      <PageHeader
        eyebrow="Print"
        title={templateTitles[template] ?? "Print View"}
        subtitle="Print-friendly ERP output with company header, structured fields, and signature blocks."
        actions={
          <Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
            Print
          </Button>
        }
      />
      {record ? (
        <PrintLayout title={templateTitles[template] ?? "ERP Document"} subtitle={config?.title ?? "Mipro ERP"} record={record} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading print data...</div>
      )}
    </>
  );
}
