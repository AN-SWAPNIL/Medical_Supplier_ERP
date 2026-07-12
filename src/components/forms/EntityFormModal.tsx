import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../ui/Button";
import type { EntityRecord, FieldConfig, RecordValue } from "../../types";

type FormValues = Record<string, RecordValue>;

type EntityFormModalProps = {
  title: string;
  fields: FieldConfig[];
  initialValue?: EntityRecord | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: EntityRecord) => void;
};

function defaultValueForField(field: FieldConfig): RecordValue {
  if (field.type === "number") {
    return 0;
  }
  if (field.type === "boolean") {
    return false;
  }
  if (field.type === "tags") {
    return [];
  }
  if (field.type === "date") {
    return new Date().toISOString().slice(0, 10);
  }
  return field.options?.[0] ?? "";
}

function schemaForFields(fields: FieldConfig[]) {
  const shape = fields.reduce<Record<string, z.ZodType<RecordValue>>>((acc, field) => {
    if (field.type === "number") {
      acc[field.key] = field.required ? z.coerce.number().min(0, `${field.label} is required`) : z.coerce.number().optional();
      return acc;
    }
    if (field.type === "boolean") {
      acc[field.key] = z.coerce.boolean();
      return acc;
    }
    if (field.type === "tags") {
      acc[field.key] = z.array(z.string()).optional();
      return acc;
    }
    acc[field.key] = field.required ? z.string().min(1, `${field.label} is required`) : z.string().optional();
    return acc;
  }, {});

  return z.object(shape);
}

export default function EntityFormModal({ title, fields, initialValue, open, onClose, onSubmit }: EntityFormModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const schema = useMemo(() => schemaForFields(fields), [fields]);
  const defaultValues = useMemo<FormValues>(() => {
    return fields.reduce<FormValues>((acc, field) => {
      acc[field.key] = initialValue?.[field.key] ?? defaultValueForField(field);
      return acc;
    }, {});
  }, [fields, initialValue]);

  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
    setFormError(null);
  }, [defaultValues, reset, open]);

  if (!open) {
    return null;
  }

  const submit = (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Please check the form values.");
      return;
    }

    onSubmit({
      ...(initialValue ?? { id: "" }),
      ...(parsed.data as EntityRecord)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            <p className="text-sm text-slate-500">Validated with React Hook Form and Zod.</p>
          </div>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="max-h-[calc(92vh-80px)] overflow-y-auto p-5" onSubmit={handleSubmit(submit)}>
          {formError ? <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{formError}</div> : null}
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <label className={field.type === "textarea" ? "md:col-span-2" : ""} key={field.key}>
                <span className="mb-1 block text-sm font-semibold text-slate-700">
                  {field.label}
                  {field.required ? <span className="text-rose-600"> *</span> : null}
                </span>
                {field.type === "select" ? (
                  <select
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    {...register(field.key)}
                    disabled={field.readOnly}
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : null}
                {field.type === "textarea" ? (
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    placeholder={field.placeholder}
                    {...register(field.key)}
                    disabled={field.readOnly}
                  />
                ) : null}
                {field.type === "boolean" ? (
                  <input className="h-5 w-5 rounded border-slate-300 text-teal-700" type="checkbox" {...register(field.key)} disabled={field.readOnly} />
                ) : null}
                {field.type !== "select" && field.type !== "textarea" && field.type !== "boolean" ? (
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    placeholder={field.placeholder}
                    {...register(field.key)}
                    disabled={field.readOnly}
                  />
                ) : null}
              </label>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
