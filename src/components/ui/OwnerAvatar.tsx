import { getInitials } from "@/lib/organization";

interface OwnerAvatarProps {
  name: string;
  size?: "sm" | "md";
}

/** Iniciales del comercial; el nombre completo queda en el tooltip y para lectores de pantalla. */
export function OwnerAvatar({ name, size = "sm" }: OwnerAvatarProps) {
  return (
    <span
      title={name}
      aria-label={`Responsable: ${name}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-slate-800 font-semibold text-white ${
        size === "sm" ? "size-6 text-[10px]" : "size-7 text-[11px]"
      }`}
    >
      {getInitials(name)}
    </span>
  );
}
