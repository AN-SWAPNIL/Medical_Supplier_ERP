import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/tables/DataTable";
import EntityFormModal from "../../components/forms/EntityFormModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DetailDrawer from "../../components/ui/DetailDrawer";
import DocumentArchivePanel from "../../components/workflow/DocumentArchivePanel";
import RecordWorkflowPanel from "../../components/workflow/RecordWorkflowPanel";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { useEffectiveRole } from "../../lib/auth/session";
import { apiClient } from "../../lib/api/client";
import { canDeleteRecordForRole, canEditRecordForRole, redactedFieldNotice, visibleColumnsForRole, visibleFieldsForRole } from "../../lib/permissions/dataVisibility";
import { hasPermission } from "../../lib/permissions/matrix";
import { useToastStore } from "../../lib/ui/toast";
import type { EntityRecord, ModuleConfig } from "../../types";
import LandedCostCalculator from "./LandedCostCalculator";
import ModuleVisualPanel from "./ModuleVisualPanel";

type ModulePageProps = {
  config: ModuleConfig;
};

export default function ModulePage({ config }: ModulePageProps) {
  const role = useEffectiveRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const [editing, setEditing] = useState<EntityRecord | null>(null);
  const [viewing, setViewing] = useState<EntityRecord | null>(null);
  const [deleting, setDeleting] = useState<EntityRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const query = useQuery({
    queryKey: [config.endpoint, role],
    queryFn: async () => (await apiClient.list(config.endpoint)).data
  });
  const documentsQuery = useQuery({
    queryKey: ["documents", role],
    queryFn: async () => (await apiClient.list("/api/documents")).data
  });

  const canCreate = hasPermission(role, config.permission, "create");
  const canEdit = hasPermission(role, config.permission, "edit");
  const canDelete = hasPermission(role, config.permission, "delete");
  const canApprove = hasPermission(role, config.permission, "approve");
  const canPost = hasPermission(role, config.permission, "post");
  const canExport = hasPermission(role, config.permission, "export");
  const visibleColumns = useMemo(() => visibleColumnsForRole(config.tableColumns, role), [config.tableColumns, role]);
  const visibleFields = useMemo(() => visibleFieldsForRole(config.fields, role), [config.fields, role]);
  const redactionNotice = redactedFieldNotice(role);

  const rows = query.data ?? [];
  const totals = useMemo(() => {
    const total = rows.length;
    const attention = rows.filter((row) => ["Attention", "Pending Approval", "Due", "3 Month Alert", "1 Month Alert"].includes(String(row.status ?? ""))).length;
    const posted = rows.filter((row) => ["Posted", "Approved", "Active", "Delivered"].includes(String(row.status ?? ""))).length;
    return { total, attention, posted };
  }, [rows]);

  const saveMutation = useMutation({
    mutationFn: async (record: EntityRecord) => {
      if (editing) {
        return (await apiClient.update(config.endpoint, editing.id, record)).data;
      }
      return (await apiClient.create(config.endpoint, record)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.endpoint] });
      setFormOpen(false);
      setEditing(null);
      pushToast({ kind: "success", title: `${config.entityName} saved` });
    },
    onError: (error) => pushToast({ kind: "error", title: "Save failed", message: error.message })
  });

  const deleteMutation = useMutation({
    mutationFn: async (record: EntityRecord) => (await apiClient.remove(config.endpoint, record.id)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.endpoint] });
      setDeleting(null);
      pushToast({ kind: "success", title: `${config.entityName} deleted` });
    },
    onError: (error) => pushToast({ kind: "error", title: "Delete failed", message: error.message })
  });

  const actionMutation = useMutation({
    mutationFn: async ({ record, action }: { record: EntityRecord; action: "submit" | "approve" | "reject" | "post" | "cancel" }) =>
      (await apiClient.action(config.endpoint, record.id, action)).data,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [config.endpoint] });
      setViewing(data);
      pushToast({ kind: "success", title: `${variables.action} completed` });
    },
    onError: (error) => pushToast({ kind: "error", title: "Action failed", message: error.message })
  });

  return (
    <>
      <PageHeader
        eyebrow={config.permission}
        title={config.title}
        subtitle={config.subtitle}
        actions={
          <>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{role}</span>
            {canCreate ? (
              <Button
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                Create {config.entityName}
              </Button>
            ) : null}
          </>
        }
      />

      {redactionNotice ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 shadow-sm">
          {redactionNotice}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Records</p>
          <strong className="mt-2 block text-3xl text-slate-950">{totals.total}</strong>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Posted / Active</p>
          <strong className="mt-2 block text-3xl text-emerald-700">{totals.posted}</strong>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Attention Required</p>
          <strong className="mt-2 block text-3xl text-amber-700">{totals.attention}</strong>
        </div>
      </div>

      {query.isLoading ? (
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-8 animate-pulse rounded bg-slate-100" />
          <div className="h-64 animate-pulse rounded bg-slate-100" />
        </div>
      ) : query.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">Could not load records.</div>
      ) : (
        <>
          <ModuleVisualPanel config={config} rows={rows} totals={totals} />
          {config.key === "customs-landed-cost" ? <LandedCostCalculator /> : null}
          {config.key === "products" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((product) => (
                <button
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  key={product.id}
                  type="button"
                  onClick={() => setViewing(product)}
                >
                  <img
                    className="h-44 w-full object-cover"
                    src={String(product.imageUrl ?? "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80")}
                    alt={String(product.productName ?? "Product")}
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-teal-700">{String(product.productCode)}</span>
                      <StatusBadge status={String(product.status ?? "Active")} />
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-slate-950">{String(product.productName)}</h2>
                    <p className="mt-1 text-sm text-slate-500">{String(product.category)} / {String(product.deviceType)}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <span className="rounded-lg bg-slate-50 p-2">
                        <small className="block text-slate-500">Unit</small>
                        <strong>{String(product.unit)}</strong>
                      </span>
                      <span className="rounded-lg bg-slate-50 p-2">
                        <small className="block text-slate-500">Purchase</small>
                        <strong>{product.purchasePrice === undefined ? "Restricted" : String(product.purchasePrice)}</strong>
                      </span>
                      <span className="rounded-lg bg-slate-50 p-2">
                        <small className="block text-slate-500">Sales</small>
                        <strong>{String(product.salesPrice)}</strong>
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
          <DataTable
            rows={rows}
            columns={visibleColumns}
            searchable={config.searchable}
            filterKey={config.filterKey}
            statusKey={config.statusKey}
            canEdit={canEdit}
            canDelete={canDelete}
            canExport={canExport}
            canPrint={Boolean(config.printTemplate)}
            onView={setViewing}
            onEdit={(record) => {
              if (!canEditRecordForRole(role, record)) {
                pushToast({ kind: "error", title: "Finalized record is locked", message: "Only Super Admin can edit approved, posted or delivered data." });
                return;
              }
              setEditing(record);
              setFormOpen(true);
            }}
            onDelete={setDeleting}
            onPrint={(record) => navigate(`/app/print/${config.printTemplate ?? "report"}/${config.key}/${record.id}`)}
            rowCanEdit={(record) => canEditRecordForRole(role, record)}
            rowCanDelete={(record) => canDeleteRecordForRole(role, record)}
          />
        </>
      )}

      <EntityFormModal
        title={editing ? `Edit ${config.entityName}` : `Create ${config.entityName}`}
        fields={visibleFields}
        initialValue={editing}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={(values) => saveMutation.mutate(values)}
      />

      <DetailDrawer open={Boolean(viewing)} title={config.entityName} record={viewing} onClose={() => setViewing(null)}>
        {viewing ? (
          <>
            <RecordWorkflowPanel
              record={viewing}
              entityName={config.entityName}
              canApprove={canApprove}
              canPost={canPost}
              canSubmit={canCreate || canEdit}
              canPrint={Boolean(config.printTemplate)}
              onAction={(action) => actionMutation.mutate({ record: viewing, action })}
              onPrint={() => navigate(`/app/print/${config.printTemplate ?? "report"}/${config.key}/${viewing.id}`)}
            />
            <DocumentArchivePanel record={viewing} documents={documentsQuery.data ?? []} />
          </>
        ) : null}
      </DetailDrawer>
      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${config.entityName}?`}
        message="This is a mock delete for the current Express session. It still uses confirmation to match the production workflow."
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteMutation.mutate(deleting);
          }
        }}
      />
    </>
  );
}
