import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  Building2,
  CheckCircle2,
  FileQuestion,
  Image,
  PackagePlus,
  Pencil,
  Plus,
  Printer,
  Save,
  ShieldCheck,
  Trash2,
  Warehouse
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  ErrorBlock,
  LoadingBlock,
  Modal,
  Panel,
  ProductThumb,
  Segmented,
  TableFrame,
  inputClass,
  labelClass,
  textareaClass
} from "../components";
import type {
  AllocationMethod,
  CashBankAccount,
  CostPreset,
  PrintConfiguration,
  Product,
  Supplier,
  WarehouseConfig
} from "../erp.types";
import { accountsService, settingsService } from "../services";
import type { Role, User } from "../../types";
import { roles } from "../../types";
import { useToastStore } from "../../lib/ui/toast";
import { formatCurrency } from "../../utils/format";

type View = "decisions" | "users" | "products" | "suppliers" | "business";
type ModalType = "user" | "product" | "supplier" | "account" | "warehouse" | "preset" | "print" | "category" | null;
type Task = { run: () => Promise<unknown>; success: string };
const capabilityOptions = [
  ["view_sensitive_cost", "View sensitive import cost"],
  ["edit_sensitive_cost", "Edit sensitive import cost"],
  ["finalize_landed_cost", "Finalize landed cost"],
  ["reopen_landed_cost", "Reopen landed cost"],
  ["view_profit", "View profit"],
  ["approve_stock_override", "Approve FIFO override"],
  ["manage_users", "Manage users"],
  ["approve_special_price", "Approve special price"]
] as const;

export default function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("view") as View | null;
  const [view, setViewState] = useState<View>(requested ?? "decisions");
  const [modal, setModal] = useState<ModalType>(null);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [editingAccount, setEditingAccount] = useState<CashBankAccount | undefined>();
  const [editingPreset, setEditingPreset] = useState<CostPreset | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<{ type: "product" | "supplier" | "account" | "preset"; id: string; label: string } | null>(null);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const usersQuery = useQuery({ queryKey: ["settings", "users"], queryFn: settingsService.users });
  const decisionsQuery = useQuery({ queryKey: ["settings", "decisions"], queryFn: settingsService.decisions });
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: settingsService.products });
  const suppliersQuery = useQuery({ queryKey: ["suppliers"], queryFn: settingsService.suppliers });
  const accountsQuery = useQuery({ queryKey: ["settings", "accounts"], queryFn: settingsService.accounts });
  const warehouseQuery = useQuery({ queryKey: ["settings", "warehouse"], queryFn: settingsService.warehouse });
  const presetsQuery = useQuery({ queryKey: ["settings", "cost-presets"], queryFn: settingsService.costPresets });
  const printQuery = useQuery({ queryKey: ["settings", "print"], queryFn: settingsService.printConfiguration });
  const categoriesQuery = useQuery({ queryKey: ["accounts", "categories"], queryFn: accountsService.categories });
  const queries = [usersQuery, decisionsQuery, productsQuery, suppliersQuery, accountsQuery, warehouseQuery, presetsQuery, printQuery, categoriesQuery];
  const error = queries.find((query) => query.error)?.error;
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["settings"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    void queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };
  const action = useMutation({
    mutationFn: (task: Task) => task.run(),
    onSuccess: (_data, task) => {
      refresh();
      setModal(null);
      setEditingUser(undefined);
      setEditingProduct(undefined);
      setEditingSupplier(undefined);
      setEditingAccount(undefined);
      setEditingPreset(undefined);
      setDeleteTarget(null);
      pushToast({ kind: "success", title: task.success });
    },
    onError: (error) => pushToast({ kind: "error", title: "Settings action failed", message: error instanceof Error ? error.message : undefined })
  });
  const setView = (next: View) => {
    setViewState(next);
    setParams({ view: next }, { replace: true });
  };

  if (queries.some((query) => query.isLoading)) return <LoadingBlock label="Loading company settings" />;
  if (error) return <ErrorBlock error={error} onRetry={() => queries.forEach((query) => void query.refetch())} />;
  const users = usersQuery.data ?? [];
  const decisions = decisionsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const suppliers = suppliersQuery.data ?? [];
  const accounts = accountsQuery.data ?? [];
  const presets = presetsQuery.data ?? [];
  const warehouse = warehouseQuery.data!;
  const printConfiguration = printQuery.data!;

  return (
    <>
      <PageHeader
        eyebrow="Super Admin"
        title="Settings"
        subtitle="Capabilities, master records, operational setup, print identity and unresolved client decisions are administered here."
        actions={
          view === "users" ? <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditingUser(undefined); setModal("user"); }}>New User</Button> :
          view === "products" ? <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditingProduct(undefined); setModal("product"); }}>New Product</Button> :
          view === "suppliers" ? <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditingSupplier(undefined); setModal("supplier"); }}>New Supplier</Button> : undefined
        }
      />

      <Segmented value={view} onChange={setView} ariaLabel="Settings groups" options={[{ value: "decisions", label: "Confirmation Queue", count: decisions.filter((decision) => decision.status !== "Confirmed").length }, { value: "users", label: "Users & Capabilities", count: users.length }, { value: "products", label: "Products", count: products.length }, { value: "suppliers", label: "Suppliers", count: suppliers.length }, { value: "business", label: "Business Setup" }]} />

      {view === "decisions" ? (
        <>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Pending client choices are visible, not silently hard-coded.</strong> Each card states current prototype behavior and the features it intentionally blocks.</div>
          <div className="grid gap-4 lg:grid-cols-2">
            {decisions.map((decision) => (
              <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm" key={decision.id}>
                <div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-amber-50 text-amber-700"><FileQuestion className="h-5 w-5" /></span><StatusBadge status={decision.status} /></div>
                <h2 className="mt-3 text-base font-bold text-slate-950">{decision.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{decision.question}</p>
                <div className="mt-3 rounded bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase text-slate-400">Current behavior</span><p className="mt-1 text-xs leading-5 text-slate-600">{decision.currentBehavior}</p></div>
                <div className="mt-3 flex flex-wrap gap-1">{decision.blocks.map((block) => <span className="rounded bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700" key={block}>Disabled: {block}</span>)}</div>
                <div className="mt-4 flex justify-end"><Button icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => action.mutate({ run: () => settingsService.updateDecision(decision.id, { status: decision.status === "Confirmed" ? "Pending Client Confirmation" : "Confirmed" }), success: decision.status === "Confirmed" ? "Decision returned to confirmation queue" : "Client decision marked confirmed" })}>{decision.status === "Confirmed" ? "Reopen Decision" : "Mark Confirmed"}</Button></div>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {view === "users" ? (
        <Panel title="Users and role capabilities" subtitle="A user’s role is assigned here and cannot be changed from inside their logged-in session.">
          <TableFrame>
            <table className="min-w-[1100px] w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Explicit Capabilities</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Edit</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id}><td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar className="h-10 w-10 rounded object-cover" src={user.avatarUrl} name={user.name} /><div><strong className="block">{user.name}</strong><small className="text-slate-500">{user.email} · {user.phone}</small></div></div></td><td className="px-4 py-3"><span className="rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{user.role}</span></td><td className="px-4 py-3 text-slate-600">{user.department}<small className="block">{user.title}</small></td><td className="max-w-md px-4 py-3"><div className="flex flex-wrap gap-1">{user.capabilities?.length ? user.capabilities.map((capability) => <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600" key={capability}>{capability.replaceAll("_", " ")}</span>) : <span className="text-xs text-slate-400">Role defaults only</span>}</div></td><td className="px-4 py-3"><StatusBadge status={user.status} /></td><td className="px-4 py-3 text-right"><Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingUser(user); setModal("user"); }} aria-label="Edit user" title="Edit user" /></td></tr>)}</tbody></table>
          </TableFrame>
        </Panel>
      ) : null}

      {view === "products" ? (
        <Panel title="Canonical product master" subtitle="One standardized variant prevents spelling duplicates from the source Item Mapping sheet.">
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => <article className="flex min-w-0 gap-3 rounded-md border border-slate-200 p-3" key={product.id}><ProductThumb src={product.imageUrl} name={product.name} size="lg" /><div className="min-w-0 flex-1"><span className="text-[10px] font-bold uppercase text-red-700">{product.code}</span><strong className="block truncate text-sm">{product.name}</strong><span className="block text-xs text-slate-500">{product.family} · {product.variant} · {product.unit}</span><span className="block text-xs font-semibold text-slate-700">{formatCurrency(product.standardSalePrice)} standard price</span><div className="mt-2 flex gap-1"><StatusBadge status={product.active ? "Active" : "Inactive"} /><Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingProduct(product); setModal("product"); }} aria-label="Edit product" title="Edit product" /><Button variant="ghost" icon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setDeleteTarget({ type: "product", id: product.id, label: product.name })} aria-label="Delete product" title="Delete product" /></div></div></article>)}
          </div>
        </Panel>
      ) : null}

      {view === "suppliers" ? (
        <Panel title="Supplier master" subtitle="Commercial terms and contact information feed directly into new import cases.">
          <TableFrame>
            <table className="min-w-[950px] w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Payment Terms</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{suppliers.map((supplier) => <tr key={supplier.id}><td className="px-4 py-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded bg-cyan-50 text-cyan-700"><Building2 className="h-4 w-4" /></span><strong>{supplier.name}</strong></div></td><td className="px-4 py-3 text-slate-600">{supplier.country}</td><td className="px-4 py-3">{supplier.contactPerson}<small className="block text-slate-500">{supplier.email} · {supplier.phone}</small></td><td className="px-4 py-3 text-slate-600">{supplier.paymentTerms}</td><td className="px-4 py-3"><StatusBadge status={supplier.active ? "Active" : "Inactive"} /></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingSupplier(supplier); setModal("supplier"); }} aria-label="Edit supplier" title="Edit supplier" /><Button variant="ghost" icon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setDeleteTarget({ type: "supplier", id: supplier.id, label: supplier.name })} aria-label="Delete supplier" title="Delete supplier" /></div></td></tr>)}</tbody></table>
          </TableFrame>
        </Panel>
      ) : null}

      {view === "business" ? (
        <div className="grid gap-4">
          <Panel title="Cash, bank and mobile accounts" subtitle="Opening balance and active status are maintained here; operational postings happen in Expenses & Accounts." actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => { setEditingAccount(undefined); setModal("account"); }}>Add Account</Button>}>
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">{accounts.map((account) => <div className="rounded-md border border-slate-200 p-3" key={account.id}><div className="flex items-start justify-between gap-2"><Banknote className="h-5 w-5 text-emerald-700" /><StatusBadge status={account.active ? "Active" : "Inactive"} /></div><strong className="mt-2 block text-sm">{account.name}</strong><span className="block text-xs text-slate-500">{account.type} · {account.accountNumber ?? "No account number"}</span><span className="mt-1 block text-sm font-bold">{formatCurrency(account.balance)}</span><div className="mt-2 flex gap-1"><Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingAccount(account); setModal("account"); }} aria-label="Edit account" title="Edit account" /><Button variant="ghost" icon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setDeleteTarget({ type: "account", id: account.id, label: account.name })} aria-label="Delete account" title="Delete account" /></div></div>)}</div>
          </Panel>
          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Warehouse" subtitle="Initial release is intentionally single-warehouse." actions={<Button icon={<Pencil className="h-4 w-4" />} onClick={() => setModal("warehouse")}>Edit</Button>}><div className="p-4"><div className="flex items-start gap-3"><Warehouse className="h-6 w-6 text-red-700" /><div><strong className="block">{warehouse.name}</strong><span className="text-sm text-slate-500">{warehouse.address}</span><span className="mt-2 block text-xs text-slate-500">{warehouse.contactPerson} · {warehouse.phone}</span></div></div><div className="mt-3 flex flex-wrap gap-1">{warehouse.locations.map((location) => <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600" key={location}>{location}</span>)}</div></div></Panel>
            <Panel title="Expense categories" subtitle="Dynamic categories include the source expenditure and TA/DA structure." actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setModal("category")}>Add</Button>}><div className="flex flex-wrap gap-2 p-4">{categoriesQuery.data?.map((category) => <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700" key={category.id}>{category.name}</span>)}</div></Panel>
          </div>
          <Panel title="Import cost presets" subtitle="Presets suggest a category or basis but always require an explicit per-row choice until the client confirms defaults." actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => { setEditingPreset(undefined); setModal("preset"); }}>Add Preset</Button>}>
            <TableFrame><table className="min-w-[800px] w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Preset</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Suggested Basis</th><th className="px-4 py-3">Choice</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{presets.map((preset) => <tr key={preset.id}><td className="px-4 py-3 font-semibold">{preset.name}</td><td className="px-4 py-3 text-slate-600">{preset.category}</td><td className="px-4 py-3">{preset.suggestedAllocationMethod?.replace("_", " ") ?? "None"}</td><td className="px-4 py-3"><span className="rounded bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">{preset.requiresExplicitChoice ? "Explicit required" : "Default allowed"}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingPreset(preset); setModal("preset"); }} aria-label="Edit preset" title="Edit preset" /><Button variant="ghost" icon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setDeleteTarget({ type: "preset", id: preset.id, label: preset.name })} aria-label="Delete preset" title="Delete preset" /></div></td></tr>)}</tbody></table></TableFrame>
          </Panel>
          <Panel title="Print configuration" subtitle="Quotation supports digital and preprinted letterhead modes from one source record." actions={<Button icon={<Printer className="h-4 w-4" />} onClick={() => setModal("print")}>Configure</Button>}><div className="grid gap-3 p-4 sm:grid-cols-[120px_1fr]"><div className="grid h-24 place-items-center overflow-hidden rounded border border-slate-200 bg-slate-50">{printConfiguration.logoUrl ? <img className="max-h-20 max-w-full object-contain" src={printConfiguration.logoUrl} alt="Company logo" /> : <Image className="h-7 w-7 text-slate-300" />}</div><div><strong className="block text-lg">{printConfiguration.companyName}</strong><span className="block text-sm text-slate-500">{printConfiguration.address}</span><span className="block text-sm text-slate-500">{printConfiguration.phone} · {printConfiguration.email}</span><span className="mt-2 inline-block rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">Default: {printConfiguration.defaultLetterheadMode}</span></div></div></Panel>
        </div>
      ) : null}

      {modal === "user" ? <Modal open title={editingUser ? "Edit user & capabilities" : "Create ERP user"} subtitle="The assigned login role controls visible destinations; explicit capabilities control sensitive actions." onClose={() => { setModal(null); setEditingUser(undefined); }} width="max-w-3xl"><UserForm user={editingUser} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => editingUser ? settingsService.updateUser(editingUser.id, payload) : settingsService.createUser(payload), success: editingUser ? "User and capabilities updated" : "ERP user created" })} /></Modal> : null}
      {modal === "product" ? <Modal open title={editingProduct ? "Edit canonical product" : "Add canonical product"} subtitle="Use one code and one variant name everywhere in import, stock and sales." onClose={() => { setModal(null); setEditingProduct(undefined); }}><ProductForm product={editingProduct} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => editingProduct ? settingsService.updateProduct(editingProduct.id, payload) : settingsService.createProduct(payload), success: editingProduct ? "Product updated" : "Product created" })} /></Modal> : null}
      {modal === "supplier" ? <Modal open title={editingSupplier ? "Edit supplier" : "Add supplier"} subtitle="Supplier master data feeds the connected import record." onClose={() => { setModal(null); setEditingSupplier(undefined); }}><SupplierForm supplier={editingSupplier} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => editingSupplier ? settingsService.updateSupplier(editingSupplier.id, payload) : settingsService.createSupplier(payload), success: editingSupplier ? "Supplier updated" : "Supplier created" })} /></Modal> : null}
      {modal === "account" ? <Modal open title={editingAccount ? "Edit cash / bank account" : "Add cash / bank account"} subtitle="Posted transaction balances cannot be erased by deleting an account." onClose={() => { setModal(null); setEditingAccount(undefined); }}><AccountForm account={editingAccount} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => editingAccount ? settingsService.updateAccount(editingAccount.id, payload) : settingsService.createAccount(payload), success: editingAccount ? "Account updated" : "Account created" })} /></Modal> : null}
      {modal === "warehouse" ? <Modal open title="Edit main warehouse" subtitle="Additional warehouses remain disabled until the client confirms scope." onClose={() => setModal(null)}><WarehouseForm warehouse={warehouse} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => settingsService.updateWarehouse(payload), success: "Warehouse configuration updated" })} /></Modal> : null}
      {modal === "preset" ? <Modal open title={editingPreset ? "Edit cost preset" : "Add cost preset"} subtitle="A preset can suggest, but cannot silently choose, the allocation method." onClose={() => { setModal(null); setEditingPreset(undefined); }}><PresetForm preset={editingPreset} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => editingPreset ? settingsService.updateCostPreset(editingPreset.id, payload) : settingsService.createCostPreset(payload), success: editingPreset ? "Cost preset updated" : "Cost preset created" })} /></Modal> : null}
      {modal === "print" ? <Modal open title="Print and letterhead configuration" subtitle="The same quotation record can be printed with digital branding or onto preprinted stationery." onClose={() => setModal(null)} width="max-w-3xl"><PrintForm configuration={printConfiguration} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => settingsService.updatePrintConfiguration(payload), success: "Print configuration updated" })} /></Modal> : null}
      {modal === "category" ? <Modal open title="Add expense category" subtitle="New categories become immediately available in daily expense entry." onClose={() => setModal(null)}><CategoryForm busy={action.isPending} onSubmit={(name) => action.mutate({ run: () => accountsService.createCategory(name), success: "Expense category added" })} /></Modal> : null}

      <ConfirmDialog open={Boolean(deleteTarget)} title={"Delete " + (deleteTarget?.type ?? "record") + "?"} message={(deleteTarget?.label ?? "") + " can be deleted only if it has no protected transaction references. Otherwise mark it inactive."} confirmLabel="Delete" onCancel={() => setDeleteTarget(null)} onConfirm={() => {
        if (!deleteTarget) return;
        const run = deleteTarget.type === "product" ? settingsService.removeProduct(deleteTarget.id) : deleteTarget.type === "supplier" ? settingsService.removeSupplier(deleteTarget.id) : deleteTarget.type === "account" ? settingsService.removeAccount(deleteTarget.id) : settingsService.removeCostPreset(deleteTarget.id);
        action.mutate({ run: () => run, success: "Unused setup record deleted" });
      }} />
    </>
  );
}

function UserForm({ user, busy, onSubmit }: { user?: User; busy: boolean; onSubmit: (payload: Partial<User> & { password?: string }) => void }) {
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", role: user?.role ?? "Sales Executive" as Role, title: user?.title ?? "", department: user?.department ?? "", phone: user?.phone ?? "", avatarUrl: user?.avatarUrl ?? "", territory: user?.territory ?? "", status: user?.status ?? "Active", password: "", capabilities: user?.capabilities ?? [] });
  const change = (key: keyof typeof form, value: string | string[]) => setForm((current) => ({ ...current, [key]: value }));
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onSubmit(form as Partial<User> & { password?: string }); }}><div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:col-span-2"><Avatar className="h-16 w-16 rounded object-cover" src={form.avatarUrl} name={form.name || "User"} /><div><strong className="block">{form.name || "New user"}</strong><span className="text-xs text-slate-500">{form.role}</span></div></div><label><span className={labelClass}>Full Name</span><input className={inputClass} required value={form.name} onChange={(event) => change("name", event.target.value)} /></label><label><span className={labelClass}>Email</span><input className={inputClass} type="email" required value={form.email} onChange={(event) => change("email", event.target.value)} /></label><label><span className={labelClass}>Assigned Role</span><select className={inputClass} value={form.role} onChange={(event) => change("role", event.target.value)}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label><label><span className={labelClass}>Status</span><select className={inputClass} value={form.status} onChange={(event) => change("status", event.target.value)}><option>Active</option><option>Pending</option><option>Inactive</option></select></label><label><span className={labelClass}>Job Title</span><input className={inputClass} required value={form.title} onChange={(event) => change("title", event.target.value)} /></label><label><span className={labelClass}>Department</span><input className={inputClass} required value={form.department} onChange={(event) => change("department", event.target.value)} /></label><label><span className={labelClass}>Phone</span><input className={inputClass} value={form.phone} onChange={(event) => change("phone", event.target.value)} /></label><label><span className={labelClass}>Territory</span><input className={inputClass} value={form.territory} onChange={(event) => change("territory", event.target.value)} /></label><label className="sm:col-span-2"><span className={labelClass}>Profile Image URL</span><input className={inputClass} value={form.avatarUrl} onChange={(event) => change("avatarUrl", event.target.value)} /></label><label className="sm:col-span-2"><span className={labelClass}>{user ? "New Password (optional)" : "Initial Password"}</span><input className={inputClass} type="password" minLength={6} required={!user} value={form.password} onChange={(event) => change("password", event.target.value)} placeholder={user ? "Leave blank to keep current password" : "Minimum 6 characters"} /></label><fieldset className="rounded-md border border-slate-200 p-3 sm:col-span-2"><legend className="px-1 text-xs font-bold uppercase text-slate-500">Explicit Capabilities</legend><div className="grid gap-2 sm:grid-cols-2">{capabilityOptions.map(([value, label]) => <label className="flex items-center gap-2 rounded bg-slate-50 p-2 text-sm" key={value}><input type="checkbox" checked={form.capabilities.includes(value)} onChange={(event) => change("capabilities", event.target.checked ? [...form.capabilities, value] : form.capabilities.filter((capability) => capability !== value))} /> {label}</label>)}</div></fieldset><div className="flex justify-end sm:col-span-2"><Button type="submit" variant="primary" icon={<ShieldCheck className="h-4 w-4" />} disabled={busy}>Save User Access</Button></div></form>;
}

function ProductForm({ product, busy, onSubmit }: { product?: Product; busy: boolean; onSubmit: (payload: Partial<Product>) => void }) {
  const [form, setForm] = useState({ code: product?.code ?? "", family: product?.family ?? "", variant: product?.variant ?? "", name: product?.name ?? "", unit: product?.unit ?? "pcs", hsCode: product?.hsCode ?? "", imageUrl: product?.imageUrl ?? "", standardSalePrice: product?.standardSalePrice ?? "", active: product?.active ?? true });
  const change = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><div className="flex items-center gap-3 rounded-md bg-slate-50 p-3 sm:col-span-2"><ProductThumb src={form.imageUrl} name={form.name || "Product"} size="lg" /><span className="text-sm text-slate-500">Product image is shown in master selection, stock and sales surfaces.</span></div>{[["code", "Product Code"], ["family", "Family"], ["variant", "Variant"], ["name", "Canonical Name"], ["unit", "Unit"], ["hsCode", "HS Code"], ["standardSalePrice", "Standard Sale Price"], ["imageUrl", "Product Image URL"]].map(([key, label]) => <label className={key === "imageUrl" ? "sm:col-span-2" : ""} key={key}><span className={labelClass}>{label}</span><input className={inputClass} type={key === "standardSalePrice" ? "number" : "text"} required={key !== "hsCode"} value={String(form[key as keyof typeof form])} onChange={(event) => change(key as keyof typeof form, event.target.value)} /></label>)}<label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={form.active} onChange={(event) => change("active", event.target.checked)} /> Active product</label><div className="flex justify-end sm:col-span-2"><Button type="submit" variant="primary" icon={<PackagePlus className="h-4 w-4" />} disabled={busy}>Save Product</Button></div></form>;
}

function SupplierForm({ supplier, busy, onSubmit }: { supplier?: Supplier; busy: boolean; onSubmit: (payload: Partial<Supplier>) => void }) {
  const [form, setForm] = useState({ name: supplier?.name ?? "", country: supplier?.country ?? "China", contactPerson: supplier?.contactPerson ?? "", phone: supplier?.phone ?? "", email: supplier?.email ?? "", paymentTerms: supplier?.paymentTerms ?? "", active: supplier?.active ?? true });
  const change = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>{[["name", "Supplier Name"], ["country", "Country"], ["contactPerson", "Contact Person"], ["phone", "Phone"], ["email", "Email"], ["paymentTerms", "Payment Terms"]].map(([key, label]) => <label key={key}><span className={labelClass}>{label}</span><input className={inputClass} type={key === "email" ? "email" : "text"} required value={String(form[key as keyof typeof form])} onChange={(event) => change(key as keyof typeof form, event.target.value)} /></label>)}<label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={form.active} onChange={(event) => change("active", event.target.checked)} /> Active supplier</label><div className="flex justify-end sm:col-span-2"><Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={busy}>Save Supplier</Button></div></form>;
}

function AccountForm({ account, busy, onSubmit }: { account?: CashBankAccount; busy: boolean; onSubmit: (payload: Partial<CashBankAccount>) => void }) {
  const [form, setForm] = useState({ name: account?.name ?? "", type: account?.type ?? "Bank", accountNumber: account?.accountNumber ?? "", balance: account?.balance ?? "0.00", active: account?.active ?? true });
  const change = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onSubmit(form as Partial<CashBankAccount>); }}><label><span className={labelClass}>Account Name</span><input className={inputClass} required value={form.name} onChange={(event) => change("name", event.target.value)} /></label><label><span className={labelClass}>Type</span><select className={inputClass} value={form.type} onChange={(event) => change("type", event.target.value)}><option>Cash</option><option>Bank</option><option>Mobile Banking</option></select></label><label><span className={labelClass}>Account Number</span><input className={inputClass} value={form.accountNumber} onChange={(event) => change("accountNumber", event.target.value)} /></label><label><span className={labelClass}>{account ? "Current Balance" : "Opening Balance"}</span><input className={inputClass} type="number" min="0" step="0.01" required value={form.balance} onChange={(event) => change("balance", event.target.value)} /></label><label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={form.active} onChange={(event) => change("active", event.target.checked)} /> Active account</label><div className="flex justify-end sm:col-span-2"><Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={busy}>Save Account</Button></div></form>;
}

function WarehouseForm({ warehouse, busy, onSubmit }: { warehouse: WarehouseConfig; busy: boolean; onSubmit: (payload: Partial<WarehouseConfig>) => void }) {
  const [form, setForm] = useState({ name: warehouse.name, address: warehouse.address, contactPerson: warehouse.contactPerson, phone: warehouse.phone, locations: warehouse.locations.join(", "), active: warehouse.active });
  const change = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, locations: form.locations.split(",").map((value) => value.trim()).filter(Boolean) }); }}><label className="sm:col-span-2"><span className={labelClass}>Warehouse Name</span><input className={inputClass} required value={form.name} onChange={(event) => change("name", event.target.value)} /></label><label className="sm:col-span-2"><span className={labelClass}>Address</span><textarea className={textareaClass} required value={form.address} onChange={(event) => change("address", event.target.value)} /></label><label><span className={labelClass}>Contact Person</span><input className={inputClass} required value={form.contactPerson} onChange={(event) => change("contactPerson", event.target.value)} /></label><label><span className={labelClass}>Phone</span><input className={inputClass} required value={form.phone} onChange={(event) => change("phone", event.target.value)} /></label><label className="sm:col-span-2"><span className={labelClass}>Rack / BIN Locations (comma separated)</span><textarea className={textareaClass} value={form.locations} onChange={(event) => change("locations", event.target.value)} /></label><div className="flex justify-end sm:col-span-2"><Button type="submit" variant="primary" icon={<Warehouse className="h-4 w-4" />} disabled={busy}>Save Warehouse</Button></div></form>;
}

function PresetForm({ preset, busy, onSubmit }: { preset?: CostPreset; busy: boolean; onSubmit: (payload: Partial<CostPreset>) => void }) {
  const [form, setForm] = useState({ name: preset?.name ?? "", category: preset?.category ?? "", suggestedAllocationMethod: preset?.suggestedAllocationMethod ?? "" as AllocationMethod | "", requiresExplicitChoice: true, active: preset?.active ?? true });
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, suggestedAllocationMethod: form.suggestedAllocationMethod || undefined }); }}><label><span className={labelClass}>Preset Name</span><input className={inputClass} required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label><label><span className={labelClass}>Category</span><input className={inputClass} required value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} /></label><label className="sm:col-span-2"><span className={labelClass}>Suggested Allocation</span><select className={inputClass} value={form.suggestedAllocationMethod} onChange={(event) => setForm((current) => ({ ...current, suggestedAllocationMethod: event.target.value as AllocationMethod | "" }))}><option value="">No suggestion</option><option value="CBM">CBM</option><option value="FOB_VALUE">FOB Value</option><option value="QUANTITY">Quantity</option><option value="PRODUCT_SPECIFIC">Product-specific</option><option value="MANUAL">Manual split</option></select></label><label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} /> Active preset</label><div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800 sm:col-span-2">Explicit user choice remains mandatory until the relevant client decision is confirmed.</div><div className="flex justify-end sm:col-span-2"><Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={busy}>Save Cost Preset</Button></div></form>;
}

function PrintForm({ configuration, busy, onSubmit }: { configuration: PrintConfiguration; busy: boolean; onSubmit: (payload: Partial<PrintConfiguration>) => void }) {
  const [form, setForm] = useState(configuration);
  const change = (key: keyof PrintConfiguration, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>{[["companyName", "Company Name"], ["address", "Address"], ["phone", "Phone"], ["email", "Email"], ["website", "Website"], ["logoUrl", "Logo URL"], ["footerText", "Footer Text"], ["authorizedSignatory", "Authorized Signatory"]].map(([key, label]) => <label className={["address", "logoUrl", "footerText"].includes(key) ? "sm:col-span-2" : ""} key={key}><span className={labelClass}>{label}</span><input className={inputClass} value={String(form[key as keyof PrintConfiguration])} onChange={(event) => change(key as keyof PrintConfiguration, event.target.value)} /></label>)}<label className="sm:col-span-2"><span className={labelClass}>Default Letterhead Mode</span><select className={inputClass} value={form.defaultLetterheadMode} onChange={(event) => change("defaultLetterheadMode", event.target.value)}><option>Digital</option><option>Preprinted</option></select></label><div className="flex justify-end sm:col-span-2"><Button type="submit" variant="primary" icon={<Printer className="h-4 w-4" />} disabled={busy}>Save Print Configuration</Button></div></form>;
}

function CategoryForm({ busy, onSubmit }: { busy: boolean; onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  return <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSubmit(name); }}><label><span className={labelClass}>Category Name</span><input className={inputClass} required minLength={2} value={name} onChange={(event) => setName(event.target.value)} /></label><div className="flex justify-end"><Button type="submit" variant="primary" icon={<Plus className="h-4 w-4" />} disabled={busy}>Add Category</Button></div></form>;
}
