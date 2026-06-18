/**
 * Logotype 404 Monkey (fallback typographique).
 * "404" en brass, "MONKEY" hérite de la couleur du parent (currentColor),
 * pour fonctionner sur fond clair comme sombre.
 */
export function BrandMark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const scale =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <span
      className={`font-display font-extrabold leading-none tracking-tight ${scale} ${className}`}
    >
      <span className="text-brass">404</span>
      <span className="ml-1.5">MONKEY</span>
    </span>
  );
}
