import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import Button from "../../components/ui/Button";
import { useAuthStore } from "../../lib/auth/session";
import { useToastStore } from "../../lib/ui/toast";
import { roles } from "../../types";
import AuthShell from "./AuthShell";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  requestedRole: z.enum(roles),
  phone: z.string().min(6),
  company: z.string().min(2)
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const signupRequest = useAuthStore((store) => store.signupRequest);
  const pushToast = useToastStore((store) => store.push);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<SignupValues>({
    defaultValues: { requestedRole: "Sales Executive", company: "Mipro HealthCare Corp." }
  });

  const submit = async (values: SignupValues) => {
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      setError("Please complete all required fields.");
      return;
    }
    await signupRequest({ id: `req-${Date.now()}`, ...parsed.data });
    setSubmitted(true);
    pushToast({ kind: "success", title: "Access request submitted", message: "Super Admin can approve and assign role later." });
  };

  return (
    <AuthShell title="Request ERP access" subtitle="ERP signup creates an approval request. It does not grant operational access until Super Admin approves and assigns a role.">
      {submitted ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
          <strong>Request submitted.</strong>
          <p className="mt-2 text-sm">A Super Admin will approve the account and assign the final ERP role.</p>
          <Link className="mt-4 inline-block font-bold text-emerald-800 underline" to="/login">
            Back to login
          </Link>
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
          {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div> : null}
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Full Name</span>
            <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("name")} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
            <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("email")} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Requested Role</span>
            <select className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("requestedRole")}>
              {roles.map((role) => (
                <option value={role} key={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Phone</span>
            <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("phone")} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Company</span>
            <input className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("company")} />
          </label>
          <Button variant="primary" type="submit" icon={<Send className="h-4 w-4" />}>
            Submit Access Request
          </Button>
          <Link className="text-sm font-semibold text-teal-700" to="/login">
            Already approved? Sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
