type AvatarProps = {
  src?: string | null;
  name: string;
  className: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export default function Avatar({ src, name, className }: AvatarProps) {
  if (src) {
    return <img className={className} src={src} alt={name} />;
  }

  return (
    <span className={className + " grid shrink-0 place-items-center bg-slate-900 text-xs font-bold text-white"} role="img" aria-label={name}>
      {initials(name)}
    </span>
  );
}
