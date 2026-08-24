import clsx from "clsx";

type MiproLogoProps = {
  className?: string;
  priority?: boolean;
};

export default function MiproLogo({ className, priority = false }: MiproLogoProps) {
  return (
    <span className={clsx("relative block shrink-0 overflow-hidden bg-white", className)}>
      <img
        className="absolute inset-x-0 top-0 h-auto w-full max-w-none"
        src="/mipro-logo.png"
        alt="MIPRO - Precision in Healthcare"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </span>
  );
}
