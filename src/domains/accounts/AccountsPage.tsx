import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Banknote, CreditCard, Eye, Landmark, Plus, RotateCcw, Save, WalletCards } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import DocumentViewer, { readDocumentUpload } from "../../components/documents/DocumentViewer";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { ErrorBlock, LoadingBlock, Modal, Panel, Segmented, TableFrame, inputClass, labelClass, textareaClass } from "../components";
import type { DocumentRecord, DocumentUpload, Expense } from "../erp.types";
import { accountsService, salesService } from "../services";
import { useEffectiveRole } from "../../lib/auth/session";
import { businessDate } from "../../lib/date";
import { useToastStore } from "../../lib/ui/toast";
import { formatCurrency } from "../../utils/format";

type View = "expenses" | "accounts" | "transactions" | "dues";
type Task = { run: () => Promise<unknown>; success: string };

export default function AccountsPage() {
  const [view, setView] = useState<View>("expenses");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [reverseExpense, setReverseExpense] = useState<Expense | null>(null);
  const [reverseReason, setReverseReason] = useState("");
  const [viewingDocument, setViewingDocument] = useState<DocumentRecord | null>(null);
  const role = useEffectiveRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const canPost = ["Super Admin", "Accounts"].includes(role);

  const expenseQuery = useQuery({ queryKey: ["accounts", "expenses"], queryFn: accountsService.expenses });
  const categoriesQuery = useQuery({ queryKey: ["accounts", "categories"], queryFn: accountsService.categories });
  const accountsQuery = useQuery({ queryKey: ["accounts", "cash-bank"], queryFn: accountsService.accounts });
  const transactionsQuery = useQuery({ queryKey: ["accounts", "transactions"], queryFn: accountsService.transactions });
  const customersQuery = useQuery({ queryKey: ["sales", "customers"], queryFn: salesService.customers });
  const collectionsQuery = useQuery({ queryKey: ["sales", "collections"], queryFn: salesService.collections });
  const queries = [expenseQuery, categoriesQuery, accountsQuery, transactionsQuery, customersQuery, collectionsQuery];
  const error = queries.find((query) => query.error)?.error;
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    void queryClient.invalidateQueries({ queryKey: ["sales"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const action = useMutation({
    mutationFn: (task: Task) => task.run(),
    onSuccess: (_data, task) => {
      refresh();
      setExpenseOpen(false);
      setCategoryOpen(false);
      setReverseExpense(null);
      setReverseReason("");
      pushToast({ kind: "success", title: task.success });
    },
    onError: (error) => pushToast({ kind: "error", title: "Accounts action failed", message: error instanceof Error ? error.message : undefined })
  });

  if (queries.some((query) => query.isLoading)) return <LoadingBlock label="Loading operational accounts" />;
  if (error) return <ErrorBlock error={error} onRetry={() => queries.forEach((query) => void query.refetch())} />;

  const expenses = expenseQuery.data ?? [];
  const accounts = accountsQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const collections = collectionsQuery.data ?? [];
  const postedExpenses = expenses.filter((expense) => expense.status === "Posted");
  const totalExpense = postedExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const totalDue = customers.reduce((sum, customer) => sum + Number(customer.currentDue), 0);
  const inflow = transactions.filter((transaction) => transaction.direction === "In").reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  return (
    <>
      <PageHeader
        eyebrow="Operational finance"
        title="Expenses & Accounts"
        subtitle="Daily expenditure, TA/DA, collections, customer dues and simple cash/bank transactions. This is not a full accounting replacement."
        actions={view === "expenses" && canPost ? <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setExpenseOpen(true)}>Post Expense</Button> : view === "dues" ? <Button icon={<Banknote className="h-4 w-4" />} onClick={() => navigate("/app/sales?view=collections")}>Post Collection</Button> : undefined}
      />

      <div className="rounded-md border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
        <strong>Clear boundary:</strong> rent, salary, office utilities, transport and TA/DA affect the selected cash/bank account only. They never enter import landed cost.
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["Posted expenses", formatCurrency(totalExpense, true), "current operating records"], ["Cash & bank", formatCurrency(totalBalance, true), accounts.length + " active accounts"], ["Customer dues", formatCurrency(totalDue, true), customers.filter((customer) => Number(customer.currentDue) > 0).length + " balances"], ["Ledger inflow", formatCurrency(inflow, true), collections.length + " collection receipts"]].map(([label, value, detail]) => <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm" key={label}><span className="text-xs text-slate-500">{label}</span><strong className="mt-1 block text-2xl text-slate-950">{value}</strong><small className="text-slate-400">{detail}</small></div>)}
      </div>

      <Segmented
        value={view}
        onChange={setView}
        ariaLabel="Accounts views"
        options={[
          { value: "expenses", label: "Daily Expenses", count: expenses.length },
          { value: "accounts", label: "Cash & Bank", count: accounts.length },
          { value: "transactions", label: "Transactions", count: transactions.length },
          { value: "dues", label: "Collections & Dues", count: customers.filter((customer) => Number(customer.currentDue) > 0).length }
        ]}
      />

      {view === "expenses" ? (
        <Panel title="Daily expenditure" subtitle="Posted financial rows are reversed with a reason instead of being silently deleted." actions={role === "Super Admin" ? <Button icon={<Plus className="h-4 w-4" />} onClick={() => setCategoryOpen(true)}>Expense Category</Button> : undefined}>
          <TableFrame>
            <table className="min-w-[1050px] w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Detail</th><th className="px-4 py-3">Paid From</th><th className="px-4 py-3">Attachment</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{expenses.map((expense) => <tr className={expense.status === "Reversed" ? "opacity-55" : ""} key={expense.id}><td className="px-4 py-3 text-slate-600">{expense.date}</td><td className="px-4 py-3"><strong>{expense.categoryName}</strong><small className="block text-slate-500">{expense.subtype}</small></td><td className="max-w-80 px-4 py-3"><span className="block truncate text-slate-700">{expense.remarks}</span>{expense.subtype === "TA/DA" ? <small className="text-slate-500">TA {formatCurrency(expense.taAmount ?? 0)} · DA {formatCurrency(expense.daAmount ?? 0)} · {expense.employee}</small> : null}</td><td className="px-4 py-3 text-slate-600">{accounts.find((account) => account.id === expense.paidFromAccountId)?.name ?? expense.paidFromAccountId}</td><td className="px-4 py-3 text-xs text-slate-500">{expense.attachmentName ?? "-"}</td><td className="px-4 py-3 text-right font-bold">{formatCurrency(expense.amount)}</td><td className="px-4 py-3"><StatusBadge status={expense.status} /></td><td className="px-4 py-3 text-right">{canPost && expense.status === "Posted" ? <Button variant="ghost" icon={<RotateCcw className="h-4 w-4 text-amber-700" />} onClick={() => setReverseExpense(expense)}>Reverse</Button> : null}</td></tr>)}</tbody></table>
          </TableFrame>
          {expenses.some((expense) => expense.attachment) ? <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 p-3"><span className="mr-1 text-xs font-bold text-slate-500">Supporting files</span>{expenses.filter((expense) => expense.attachment).map((expense) => <Button variant="ghost" icon={<Eye className="h-4 w-4" />} onClick={() => setViewingDocument(expense.attachment!)} key={expense.id}>View {expense.attachment!.fileName}</Button>)}</div> : null}
        </Panel>
      ) : null}

      {view === "accounts" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {accounts.map((account) => {
            const Icon = account.type === "Cash" ? WalletCards : account.type === "Bank" ? Landmark : CreditCard;
            const recent = transactions.filter((transaction) => transaction.accountId === account.id).slice(0, 3);
            return <Panel key={account.id} title={account.name} subtitle={[account.type, account.accountNumber].filter(Boolean).join(" · ")} actions={<Icon className="h-5 w-5 text-red-700" />}><div className="p-4"><span className="text-xs text-slate-500">Available balance</span><strong className="mt-1 block text-3xl">{formatCurrency(account.balance)}</strong></div><div className="divide-y divide-slate-100 border-t border-slate-200">{recent.map((transaction) => <div className="flex items-center gap-3 px-4 py-2.5" key={transaction.id}>{transaction.direction === "In" ? <ArrowDownLeft className="h-4 w-4 text-emerald-600" /> : <ArrowUpRight className="h-4 w-4 text-red-600" />}<span className="min-w-0 flex-1 truncate text-xs text-slate-600">{transaction.description}</span><strong className={"text-xs " + (transaction.direction === "In" ? "text-emerald-700" : "text-red-700")}>{transaction.direction === "In" ? "+" : "-"}{formatCurrency(transaction.amount)}</strong></div>)}</div></Panel>;
          })}
        </div>
      ) : null}

      {view === "transactions" ? (
        <Panel title="Simple transaction ledger" subtitle="Every collection, expense and reversal identifies its source record.">
          <TableFrame>
            <table className="min-w-[950px] w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Account</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Description</th><th className="px-4 py-3 text-right">In</th><th className="px-4 py-3 text-right">Out</th></tr></thead><tbody className="divide-y divide-slate-100">{transactions.map((transaction) => <tr key={transaction.id}><td className="px-4 py-3 text-slate-600">{transaction.date}</td><td className="px-4 py-3 font-semibold">{transaction.accountName}</td><td className="px-4 py-3"><span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{transaction.sourceType}</span></td><td className="px-4 py-3 text-slate-600">{transaction.description}</td><td className="px-4 py-3 text-right font-bold text-emerald-700">{transaction.direction === "In" ? formatCurrency(transaction.amount) : "-"}</td><td className="px-4 py-3 text-right font-bold text-red-700">{transaction.direction === "Out" ? formatCurrency(transaction.amount) : "-"}</td></tr>)}</tbody></table>
          </TableFrame>
        </Panel>
      ) : null}

      {view === "dues" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Customer dues" subtitle="One balance per normalized customer ledger.">
            <div className="divide-y divide-slate-100">{[...customers].sort((a, b) => Number(b.currentDue) - Number(a.currentDue)).map((customer) => <div className="flex items-center gap-3 px-4 py-3" key={customer.id}><span className="grid h-9 w-9 place-items-center rounded bg-red-50 text-xs font-bold text-red-700">{customer.name.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><strong className="block truncate text-sm">{customer.name}</strong><span className="text-xs text-slate-500">{customer.paymentTerms} · limit {formatCurrency(customer.creditLimit)}</span></div><strong className="text-sm text-red-700">{formatCurrency(customer.currentDue)}</strong></div>)}</div>
          </Panel>
          <Panel title="Recent collections" subtitle="Receipts post into the selected account ledger.">
            <div className="divide-y divide-slate-100">{collections.slice(0, 10).map((collection) => <div className="flex items-center gap-3 px-4 py-3" key={collection.id}><Banknote className="h-4 w-4 text-emerald-600" /><div className="min-w-0 flex-1"><strong className="block truncate text-sm">{collection.customerName}</strong><span className="text-xs text-slate-500">{collection.receiptNumber} · {collection.paymentMode}</span></div><strong className="text-sm text-emerald-700">{formatCurrency(collection.amount)}</strong></div>)}</div>
            <div className="border-t border-slate-200 p-3"><Button className="w-full" icon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate("/app/sales?view=collections")}>Open Collection Workspace</Button></div>
          </Panel>
        </div>
      ) : null}

      <Modal open={expenseOpen} title="Post daily expense" subtitle="Choose the exact cash or bank account. This entry remains outside landed cost." onClose={() => setExpenseOpen(false)} width="max-w-3xl"><ExpenseForm categories={categoriesQuery.data ?? []} accounts={accounts} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => accountsService.createExpense(payload), success: "Expense posted to operational ledger" })} /></Modal>
      <Modal open={categoryOpen} title="Add expense category" subtitle="Categories remain dynamic; existing expense history keeps its posted name." onClose={() => setCategoryOpen(false)}><CategoryForm busy={action.isPending} onSubmit={(name) => action.mutate({ run: () => accountsService.createCategory(name), success: "Expense category added" })} /></Modal>
      <Modal open={Boolean(reverseExpense)} title="Reverse posted expense" subtitle="Reversal restores the selected account balance and creates an audit trail." onClose={() => { setReverseExpense(null); setReverseReason(""); }}><form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); if (reverseExpense) action.mutate({ run: () => accountsService.reverseExpense(reverseExpense.id, reverseReason), success: "Expense reversed and balance restored" }); }}><div className="rounded-md bg-slate-50 p-3 text-sm"><strong>{reverseExpense?.categoryName}</strong><span className="block text-slate-500">{formatCurrency(reverseExpense?.amount ?? 0)} · {reverseExpense?.remarks}</span></div><label><span className={labelClass}>Reversal Reason</span><textarea className={textareaClass} minLength={5} required value={reverseReason} onChange={(event) => setReverseReason(event.target.value)} /></label><div className="flex justify-end"><Button type="submit" variant="primary" icon={<RotateCcw className="h-4 w-4" />} disabled={action.isPending || reverseReason.trim().length < 5}>Post Reversal</Button></div></form></Modal>
      <DocumentViewer document={viewingDocument} onClose={() => setViewingDocument(null)} />
    </>
  );
}

function ExpenseForm({ categories, accounts, busy, onSubmit }: { categories: { id: string; name: string; active: boolean }[]; accounts: { id: string; name: string; balance: string }[]; busy: boolean; onSubmit: (payload: Partial<Expense> & { attachmentUpload?: DocumentUpload }) => void }) {
  const [form, setForm] = useState({ date: businessDate(), categoryId: "", subtype: "General" as Expense["subtype"], amount: "", paidFromAccountId: "", employee: "", designation: "", taAmount: "", daAmount: "", remarks: "", attachmentName: "" });
  const [attachmentUpload, setAttachmentUpload] = useState<DocumentUpload>();
  const [fileError, setFileError] = useState("");
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const amount = form.subtype === "TA/DA" ? Number(form.taAmount || 0) + Number(form.daAmount || 0) : Number(form.amount || 0);
  const changeAttachment = (input: HTMLInputElement) => {
    const file = input.files?.[0];
    change("attachmentName", file?.name ?? "");
    setAttachmentUpload(undefined);
    input.setCustomValidity("");
    setFileError("");
    if (!file) return;
    void readDocumentUpload(file)
      .then((upload) => setAttachmentUpload(upload))
      .catch((reason) => {
        const message = reason instanceof Error ? reason.message : "Attachment could not be read.";
        input.setCustomValidity(message);
        input.reportValidity();
        change("attachmentName", "");
        setFileError(message);
      });
  };
  const submit = (event: FormEvent) => { event.preventDefault(); if (fileError) return; onSubmit({ ...form, amount: amount.toFixed(2), taAmount: form.subtype === "TA/DA" ? Number(form.taAmount || 0).toFixed(2) : undefined, daAmount: form.subtype === "TA/DA" ? Number(form.daAmount || 0).toFixed(2) : undefined, attachmentUpload }); };
  return <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={submit}><label><span className={labelClass}>Date</span><input className={inputClass} type="date" required value={form.date} onChange={(event) => change("date", event.target.value)} /></label><label><span className={labelClass}>Category</span><select className={inputClass} required value={form.categoryId} onChange={(event) => change("categoryId", event.target.value)}><option value="">Select category</option>{categories.filter((category) => category.active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label><span className={labelClass}>Subtype</span><select className={inputClass} value={form.subtype} onChange={(event) => change("subtype", event.target.value)}><option>General</option><option>TA/DA</option></select></label>{form.subtype === "TA/DA" ? <><label><span className={labelClass}>Employee</span><input className={inputClass} required value={form.employee} onChange={(event) => change("employee", event.target.value)} /></label><label><span className={labelClass}>Designation</span><input className={inputClass} value={form.designation} onChange={(event) => change("designation", event.target.value)} /></label><div /><label><span className={labelClass}>TA Amount</span><input className={inputClass} type="number" min="0" step="0.01" required value={form.taAmount} onChange={(event) => change("taAmount", event.target.value)} /></label><label><span className={labelClass}>DA Amount</span><input className={inputClass} type="number" min="0" step="0.01" required value={form.daAmount} onChange={(event) => change("daAmount", event.target.value)} /></label><div className="rounded-md border border-cyan-200 bg-cyan-50 p-3"><span className="text-xs text-cyan-800">Total TA/DA</span><strong className="block">{formatCurrency(amount)}</strong></div></> : <label><span className={labelClass}>Amount</span><input className={inputClass} type="number" min="0.01" step="0.01" required value={form.amount} onChange={(event) => change("amount", event.target.value)} /></label>}<label><span className={labelClass}>Paid From</span><select className={inputClass} required value={form.paidFromAccountId} onChange={(event) => change("paidFromAccountId", event.target.value)}><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} · {formatCurrency(account.balance)}</option>)}</select></label><label><span className={labelClass}>Attachment</span><input className={inputClass + " pt-2"} type="file" accept="application/pdf,image/png,image/jpeg,image/webp,image/gif" onChange={(event) => changeAttachment(event.target)} /></label><label className="sm:col-span-2 lg:col-span-3"><span className={labelClass}>Remarks</span><textarea className={textareaClass} required value={form.remarks} onChange={(event) => change("remarks", event.target.value)} /></label><div className="flex justify-end sm:col-span-2 lg:col-span-3"><Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={busy || amount <= 0}>Post Expense</Button></div></form>;
}

function CategoryForm({ busy, onSubmit }: { busy: boolean; onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  return <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSubmit(name); }}><label><span className={labelClass}>Category Name</span><input className={inputClass} minLength={2} required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Regulatory renewal" /></label><div className="flex justify-end"><Button type="submit" variant="primary" icon={<Plus className="h-4 w-4" />} disabled={busy}>Add Category</Button></div></form>;
}
