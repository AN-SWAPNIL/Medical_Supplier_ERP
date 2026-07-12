import { Check, ShieldCheck, X } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { permissionMatrix } from "../../lib/permissions/matrix";
import { roles, type PermissionAction, type PermissionKey } from "../../types";
import UserPermissionToggles from "./UserPermissionToggles";

const modules: PermissionKey[] = [
  "dashboard",
  "users",
  "roles",
  "master-data",
  "suppliers",
  "customers",
  "products",
  "procurement",
  "import",
  "shipments",
  "customs",
  "warehouse",
  "inventory",
  "sales",
  "accounts",
  "expenses",
  "hr",
  "transport",
  "reports",
  "ai",
  "audit",
  "settings"
];

const actions: PermissionAction[] = ["view", "create", "edit", "delete", "approve", "post", "export"];

export default function RoleMatrixPage() {
  return (
    <>
      <PageHeader
        eyebrow="RBAC"
        title="Role & Permission Matrix"
        subtitle="Central matrix controlling sidebar visibility, route blocking, action buttons and data scope. Sales Executive data remains owner-scoped."
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            <ShieldCheck className="h-4 w-4" />
            Centralized permissions
          </span>
        }
      />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="sticky left-0 bg-slate-50 px-4 py-3 text-left font-bold text-slate-600">Role / Module</th>
                {modules.map((module) => (
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500" key={module}>
                    {module}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((role) => (
                <tr key={role}>
                  <td className="sticky left-0 bg-white px-4 py-3 font-bold text-slate-950">{role}</td>
                  {modules.map((module) => {
                    const allowed = permissionMatrix[role][module] ?? [];
                    return (
                      <td className="px-3 py-3" key={module}>
                        {allowed.includes("view") ? (
                          <div className="flex flex-wrap gap-1">
                            {actions.map((action) => (
                              <span className="inline-flex items-center gap-1 rounded bg-slate-50 px-1.5 py-1 text-[11px] font-semibold text-slate-600" key={action}>
                                {allowed.includes(action) ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-slate-300" />}
                                {action[0]}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300">Blocked</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <UserPermissionToggles />
    </>
  );
}
