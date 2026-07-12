import { useQuery } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../../components/ui/Button";
import { apiClient } from "../../lib/api/client";
import { useAuthStore } from "../../lib/auth/session";
import { useToastStore } from "../../lib/ui/toast";
import AuthShell from "./AuthShell";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

type LoginValues = z.infer<typeof loginSchema>;

type LocationState = {
  from?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const login = useAuthStore((store) => store.login);
  const pushToast = useToastStore((store) => store.push);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setValue } = useForm<LoginValues>({
    defaultValues: { email: "superadmin@mipro.local", password: "password123" }
  });
  const demoUsers = useQuery({
    queryKey: ["demo-users"],
    queryFn: async () => (await apiClient.demoUsers()).data
  });

  const submit = async (values: LoginValues) => {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setFormError("Enter a valid email and password.");
      return;
    }

    try {
      await login(parsed.data.email, parsed.data.password);
      pushToast({ kind: "success", title: "Signed in", message: "Role-based ERP session started." });
      navigate(state?.from ?? "/app/dashboard", { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Login failed.");
    }
  };

  return (
    <AuthShell title="Sign in to ERP" subtitle="Use one of the demo accounts or enter the assigned ERP credentials. Role access is enforced after login.">
      <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
        {formError ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{formError}</div> : null}
        <label>
          <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
          <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" {...register("email")} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
          <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" type="password" {...register("password")} />
        </label>
        <Button variant="primary" type="submit" icon={<LogIn className="h-4 w-4" />}>
          Sign In
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
        <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/signup">
          Request access
        </Link>
        <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/forgot-password">
          Forgot password?
        </Link>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Demo role selector</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(demoUsers.data ?? []).map((user) => (
            <button
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-teal-300 hover:bg-teal-50"
              key={user.email}
              type="button"
              onClick={() => {
                setValue("email", user.email);
                setValue("password", "password123");
              }}
            >
              <strong className="block text-sm text-slate-950">{user.role}</strong>
              <span className="block text-xs text-slate-500">{user.email}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}
