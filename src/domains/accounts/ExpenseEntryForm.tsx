import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { readDocumentUpload } from "../../components/documents/DocumentViewer";
import EmployeePicker from "../../components/employees/EmployeePicker";
import Button from "../../components/ui/Button";
import { businessDate } from "../../lib/date";
import { formatCurrency } from "../../utils/format";
import { inputClass, labelClass, textareaClass } from "../components";
import type { DocumentUpload, EmployeeDirectoryEntry, Expense } from "../erp.types";

type Props = {
  categories: { id: string; name: string; active: boolean }[];
  accounts: { id: string; name: string; balance: string }[];
  employees: EmployeeDirectoryEntry[];
  busy: boolean;
  onSubmit: (payload: Partial<Expense> & { attachmentUpload?: DocumentUpload }) => void;
};

export default function ExpenseEntryForm({ categories, accounts, employees, busy, onSubmit }: Props) {
  const [form, setForm] = useState({ date: businessDate(), categoryId: "", subtype: "General" as Expense["subtype"], expenseFor: "Company / General" as Expense["expenseFor"], employeeId: "", amount: "", paidFromAccountId: "", taAmount: "", daAmount: "", remarks: "" });
  const [attachmentUpload, setAttachmentUpload] = useState<DocumentUpload>();
  const [fileError, setFileError] = useState("");
  const amount = form.subtype === "TA/DA" ? Number(form.taAmount || 0) + Number(form.daAmount || 0) : Number(form.amount || 0);
  const selectedEmployee = employees.find((employee) => employee.id === form.employeeId);
  const change = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));

  const changeSubtype = (subtype: Expense["subtype"]) => {
    setForm((current) => ({ ...current, subtype, expenseFor: subtype === "TA/DA" ? "Employee" : current.expenseFor }));
  };

  const changeAttachment = (input: HTMLInputElement) => {
    const file = input.files?.[0];
    setAttachmentUpload(undefined);
    setFileError("");
    input.setCustomValidity("");
    if (!file) return;
    void readDocumentUpload(file)
      .then((upload) => {
        setAttachmentUpload(upload);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Attachment could not be read.";
        setFileError(message);
        input.setCustomValidity(message);
        input.reportValidity();
      });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (fileError || (form.expenseFor === "Employee" && !selectedEmployee)) return;
    onSubmit({
      date: form.date,
      categoryId: form.categoryId,
      subtype: form.subtype,
      expenseFor: form.expenseFor,
      employeeId: form.expenseFor === "Employee" ? form.employeeId : undefined,
      amount: amount.toFixed(2),
      paidFromAccountId: form.paidFromAccountId,
      taAmount: form.subtype === "TA/DA" ? Number(form.taAmount || 0).toFixed(2) : undefined,
      daAmount: form.subtype === "TA/DA" ? Number(form.daAmount || 0).toFixed(2) : undefined,
      remarks: form.remarks,
      attachmentName: attachmentUpload?.fileName,
      attachmentUpload
    });
  };

  return (
    <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={submit}>
      <label><span className={labelClass}>Date</span><input className={inputClass} type="date" required value={form.date} onChange={(event) => change("date", event.target.value)} /></label>
      <label><span className={labelClass}>Category</span><select className={inputClass} required value={form.categoryId} onChange={(event) => change("categoryId", event.target.value)}><option value="">Select category</option>{categories.filter((category) => category.active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label><span className={labelClass}>Subtype</span><select className={inputClass} value={form.subtype} onChange={(event) => changeSubtype(event.target.value as Expense["subtype"])}><option>General</option><option>TA/DA</option></select></label>
      <label><span className={labelClass}>Expense For</span><select className={inputClass} value={form.expenseFor} disabled={form.subtype === "TA/DA"} onChange={(event) => change("expenseFor", event.target.value as Expense["expenseFor"])}><option>Employee</option><option>Office</option><option>Warehouse</option><option>Company / General</option></select></label>
      {form.expenseFor === "Employee" ? <div className="sm:col-span-2"><EmployeePicker employees={employees} value={form.employeeId} onChange={(employeeId) => change("employeeId", employeeId)} allowAll={false} label="Employee" />{selectedEmployee ? <p className="mt-1 text-xs text-slate-500">{selectedEmployee.employeeCode} | {selectedEmployee.title} | {selectedEmployee.department}</p> : null}</div> : <div className="rounded-md border border-cyan-200 bg-cyan-50 p-3 sm:col-span-2"><span className="text-xs font-semibold text-cyan-800">Attributed to</span><strong className="mt-1 block text-sm text-cyan-950">{form.expenseFor === "Office" ? "Head Office" : form.expenseFor === "Warehouse" ? "MIPRO Main Warehouse" : "MIPRO HealthCare Corporation"}</strong></div>}
      {form.subtype === "TA/DA" ? <><label><span className={labelClass}>TA Amount</span><input className={inputClass} type="number" min="0" step="0.01" required value={form.taAmount} onChange={(event) => change("taAmount", event.target.value)} /></label><label><span className={labelClass}>DA Amount</span><input className={inputClass} type="number" min="0" step="0.01" required value={form.daAmount} onChange={(event) => change("daAmount", event.target.value)} /></label><div className="rounded-md border border-slate-200 bg-slate-50 p-3"><span className="text-xs text-slate-500">Total TA/DA</span><strong className="mt-1 block text-lg">{formatCurrency(amount)}</strong></div></> : <label><span className={labelClass}>Amount</span><input className={inputClass} type="number" min="0.01" step="0.01" required value={form.amount} onChange={(event) => change("amount", event.target.value)} /></label>}
      <label><span className={labelClass}>Paid From</span><select className={inputClass} required value={form.paidFromAccountId} onChange={(event) => change("paidFromAccountId", event.target.value)}><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} | {formatCurrency(account.balance)}</option>)}</select></label>
      <label className="sm:col-span-2"><span className={labelClass}>Attachment</span><input className={inputClass + " pt-2"} type="file" accept="application/pdf,image/png,image/jpeg,image/webp,image/gif" onChange={(event) => changeAttachment(event.target)} />{attachmentUpload ? <small className="mt-1 block font-semibold text-cyan-800">{attachmentUpload.fileName}</small> : null}{fileError ? <small className="mt-1 block text-rose-700">{fileError}</small> : null}</label>
      <label className="sm:col-span-2 lg:col-span-3"><span className={labelClass}>Remarks</span><textarea className={textareaClass} required value={form.remarks} onChange={(event) => change("remarks", event.target.value)} /></label>
      <div className="flex justify-end sm:col-span-2 lg:col-span-3"><Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={busy || amount <= 0 || (form.expenseFor === "Employee" && !form.employeeId)}>Post Expense</Button></div>
    </form>
  );
}
