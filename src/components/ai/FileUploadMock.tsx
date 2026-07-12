import { FileSearch, UploadCloud } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";

type FileUploadMockProps = {
  onExtract?: () => void;
};

export default function FileUploadMock({ onExtract }: FileUploadMockProps) {
  const [fileName, setFileName] = useState("PI-RH-26061.pdf");

  return (
    <div className="rounded-xl border border-dashed border-teal-300 bg-teal-50/60 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-teal-700">
            <UploadCloud className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-slate-950">Mock import document upload</h3>
            <p className="mt-1 text-sm text-slate-600">Select any file name to simulate extraction. No file leaves the browser in this prototype.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            className="h-10 rounded-lg border border-teal-200 bg-white px-3 text-sm"
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
          />
          <Button variant="primary" icon={<FileSearch className="h-4 w-4" />} onClick={onExtract}>
            Extract Fields
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {[
          ["Supplier", "Guangzhou Renhe Medical Technology"],
          ["PI Number", "PI-RH-26061"],
          ["LC Number", "LC-77612"],
          ["Amount", "USD 90,000"]
        ].map(([label, value]) => (
          <div className="rounded-lg bg-white p-3 shadow-sm" key={label}>
            <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
