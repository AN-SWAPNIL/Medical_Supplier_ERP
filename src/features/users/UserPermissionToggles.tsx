import { SlidersHorizontal, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { demoUsers } from "../../data/seed";
import StatusBadge from "../../components/ui/StatusBadge";

const toggleLabels = [
  "View invoices",
  "Own invoices only",
  "Hide cost & margin",
  "Export allowed",
  "Approve allowed",
  "GPS check-in required",
  "2FA required"
];

function defaultsForRole(role: string) {
  return {
    "View invoices": ["Super Admin", "Managing Director", "Accounts", "Sales Manager", "Sales Executive"].includes(role),
    "Own invoices only": role === "Sales Executive",
    "Hide cost & margin": role === "Sales Executive" || role === "Sales Manager",
    "Export allowed": role !== "Sales Executive",
    "Approve allowed": ["Super Admin", "Managing Director", "Sales Manager", "Accounts"].includes(role),
    "GPS check-in required": role === "Sales Executive",
    "2FA required": ["Super Admin", "Managing Director", "Accounts"].includes(role)
  };
}

export default function UserPermissionToggles() {
  const [selectedUserId, setSelectedUserId] = useState(demoUsers[0].id);
  const selectedUser = demoUsers.find((user) => user.id === selectedUserId) ?? demoUsers[0];
  const defaults = useMemo(() => defaultsForRole(selectedUser.role), [selectedUser.role]);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const enabled = (label: string) => overrides[`${selectedUser.id}:${label}`] ?? defaults[label as keyof typeof defaults];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-teal-700">User-Level Access Toggles</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Granular permission control mock</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">
            The meeting minutes asked for toggle-based access such as invoice visibility, own-record scope, export rights and cost privacy.
            This panel is frontend-only for the prototype, but it models the exact backend policy shape.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
          <SlidersHorizontal className="h-4 w-4" />
          Demo toggles
        </span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="grid gap-2">
          {demoUsers.map((user) => (
            <button
              className={`rounded-lg border p-3 text-left transition ${
                selectedUserId === user.id ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-slate-50 hover:bg-white"
              }`}
              key={user.id}
              type="button"
              onClick={() => setSelectedUserId(user.id)}
            >
              <div className="flex items-center gap-3">
                <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                <div className="min-w-0">
                  <strong className="block truncate text-sm text-slate-950">{user.name}</strong>
                  <span className="block truncate text-xs text-slate-500">{user.role}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-teal-700 shadow-sm">
                <UserCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-950">{selectedUser.name}</h3>
                <p className="text-sm text-slate-500">{selectedUser.title}</p>
              </div>
            </div>
            <StatusBadge status={selectedUser.role} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {toggleLabels.map((label) => (
              <label className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3" key={label}>
                <span>
                  <strong className="block text-sm text-slate-800">{label}</strong>
                  <small className="text-slate-500">{enabled(label) ? "Enabled" : "Disabled"}</small>
                </span>
                <input
                  checked={enabled(label)}
                  className="h-5 w-5 rounded border-slate-300 text-teal-700"
                  type="checkbox"
                  onChange={(event) =>
                    setOverrides((current) => ({
                      ...current,
                      [`${selectedUser.id}:${label}`]: event.target.checked
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
