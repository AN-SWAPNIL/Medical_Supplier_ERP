import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useAuthStore } from "../../lib/auth/session";
import AuthShell from "./AuthShell";

export default function ResetPasswordPage() {
  const resetPassword = useAuthStore((store) => store.resetPassword);
  const [done, setDone] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string; password: string }>({
    defaultValues: { email: "accounts@mipro.local", password: "password123" }
  });

  return (
    <AuthShell title="Reset password" subtitle="Mock password reset screen. Production auth can swap this for Supabase without changing route flow.">
      {done ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
          <strong>Password reset saved for demo.</strong>
          <Link className="mt-4 block font-bold underline" to="/login">
            Return to login
          </Link>
        </div>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={handleSubmit(async (values) => {
            await resetPassword(values.email, values.password);
            setDone(true);
          })}
        >
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
            <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("email")} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">New Password</span>
            <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" type="password" {...register("password")} />
          </label>
          <Button type="submit" variant="primary" icon={<KeyRound className="h-4 w-4" />}>
            Save New Password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
