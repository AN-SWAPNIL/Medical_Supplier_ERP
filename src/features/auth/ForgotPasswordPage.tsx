import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useAuthStore } from "../../lib/auth/session";
import AuthShell from "./AuthShell";

export default function ForgotPasswordPage() {
  const forgotPassword = useAuthStore((store) => store.forgotPassword);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string }>({ defaultValues: { email: "accounts@mipro.local" } });

  return (
    <AuthShell title="Forgot password" subtitle="Mock reset email flow for future Supabase auth compatibility.">
      {sent ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-800">
          <strong>Reset link generated.</strong>
          <p className="mt-2 text-sm">For demo, continue to the reset page and set a mock password.</p>
          <Link className="mt-4 inline-block font-bold underline" to="/reset-password">
            Open reset password
          </Link>
        </div>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={handleSubmit(async (values) => {
            await forgotPassword(values.email);
            setSent(true);
          })}
        >
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
            <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("email")} />
          </label>
          <Button type="submit" variant="primary" icon={<Mail className="h-4 w-4" />}>
            Send Reset Link
          </Button>
          <Link className="text-sm font-semibold text-teal-700" to="/login">
            Back to login
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
