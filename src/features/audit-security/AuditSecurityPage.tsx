import { useQuery } from "@tanstack/react-query";
import { Archive, DatabaseBackup, LockKeyhole, ShieldCheck, Smartphone, Wifi } from "lucide-react";
import DataTable from "../../components/tables/DataTable";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { apiClient } from "../../lib/api/client";

const securityCards = [
  ["Role-Based Access Control", "Central matrix protects module, route, button and data visibility.", ShieldCheck, "Active"],
  ["2FA Settings Mock", "Recommended for production login and sensitive approvals.", LockKeyhole, "Recommended"],
  ["IP Restriction Mock", "Future per-user and department IP allowlist ready.", Wifi, "Draft"],
  ["Daily Backup Status", "Offsite backup placeholder for production deployment.", DatabaseBackup, "Healthy"],
  ["Document Archive", "PI, PO, LC, COA, CE, ISO and customs documents archived.", Archive, "Active"],
  ["Device Activity", "Login activity by IP, browser and device.", Smartphone, "Tracked"]
];

export default function AuditSecurityPage() {
  const audit = useQuery({ queryKey: ["audit"], queryFn: async () => (await apiClient.list("/api/audit-logs")).data });
  const login = useQuery({ queryKey: ["login-activity"], queryFn: async () => (await apiClient.list("/api/login-activity")).data });

  return (
    <>
      <PageHeader
        eyebrow="Audit & Security"
        title="Security, Audit & Compliance Control"
        subtitle="Sensitive actions are traceable by user, role, module, record, timestamp, IP and device. Print/document archive and backup placeholders are ready."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {securityCards.map(([title, body, Icon, status]) => (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={title as string}>
            <div className="flex items-start justify-between gap-3">
              <Icon className="h-6 w-6 text-teal-700" />
              <StatusBadge status={status as string} />
            </div>
            <h2 className="mt-3 font-bold text-slate-950">{title as string}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{body as string}</p>
          </div>
        ))}
      </div>
      <DataTable
        rows={audit.data ?? []}
        columns={["user", "role", "action", "module", "recordId", "timestamp", "ipAddress", "status"]}
        searchable={["user", "role", "action", "module", "recordId"]}
        filterKey="role"
        statusKey="status"
        canExport
        onView={() => undefined}
        onEdit={() => undefined}
        onDelete={() => undefined}
      />
      <DataTable
        rows={login.data ?? []}
        columns={["user", "role", "loginTime", "ipAddress", "device", "status"]}
        searchable={["user", "role", "ipAddress", "device"]}
        filterKey="role"
        statusKey="status"
        canExport
        onView={() => undefined}
        onEdit={() => undefined}
        onDelete={() => undefined}
      />
    </>
  );
}
