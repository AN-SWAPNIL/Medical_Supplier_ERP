import { Camera, KeyRound, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { useAuthStore } from "../../lib/auth/session";
import { useToastStore } from "../../lib/ui/toast";

type ProfileValues = {
  name: string;
  email: string;
  title: string;
  department: string;
  phone: string;
  avatarUrl: string;
};

export default function ProfilePage() {
  const session = useAuthStore((state) => state.session);
  const updateUser = useAuthStore((state) => state.updateUser);
  const pushToast = useToastStore((state) => state.push);
  const [avatarPreview, setAvatarPreview] = useState(session?.user.avatarUrl ?? "");
  const { register, handleSubmit } = useForm<ProfileValues>({
    defaultValues: session?.user
  });

  if (!session) {
    return null;
  }

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="Profile & Security Settings"
        subtitle="Update profile photo and contact details. Role remains locked to the login account except for Super Admin demo view-as mode."
      />

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <img className="mx-auto h-36 w-36 rounded-full border-4 border-white object-cover shadow-lg" src={avatarPreview} alt={session.user.name} />
          <h2 className="mt-4 text-xl font-bold text-slate-950">{session.user.name}</h2>
          <p className="text-sm text-slate-500">{session.user.role}</p>
          <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Camera className="h-4 w-4" />
            Upload Image
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setAvatarPreview(String(reader.result));
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <div className="mt-5 grid gap-2 text-left text-sm">
            <span className="rounded-lg bg-slate-50 p-3">{session.user.email}</span>
            <span className="rounded-lg bg-slate-50 p-3">{session.user.department}</span>
            <span className="rounded-lg bg-slate-50 p-3">2FA mock: Recommended</span>
          </div>
        </div>

        <form
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit((values) => {
            updateUser({ ...session.user, ...values, avatarUrl: avatarPreview });
            pushToast({ kind: "success", title: "Profile saved" });
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["name", "Full Name"],
              ["email", "Email"],
              ["title", "Job Title"],
              ["department", "Department"],
              ["phone", "Phone"],
              ["avatarUrl", "Avatar URL"]
            ].map(([key, label]) => (
              <label key={key} className={key === "avatarUrl" ? "md:col-span-2" : ""}>
                <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  {...register(key as keyof ProfileValues)}
                  disabled={key === "email"}
                />
              </label>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />}>
              Save Profile
            </Button>
            <Button type="button" icon={<KeyRound className="h-4 w-4" />}>
              Change Password Mock
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
