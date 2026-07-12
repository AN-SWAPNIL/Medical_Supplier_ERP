import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: ReactNode;
};

const variantClass = {
  primary: "bg-teal-700 text-white hover:bg-teal-800 border-teal-700",
  secondary: "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
  danger: "bg-white text-rose-700 hover:bg-rose-50 border-rose-200",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent"
};

export default function Button({ className, variant = "secondary", icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClass[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
