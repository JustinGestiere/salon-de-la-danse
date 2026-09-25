import Image from "next/image";

export type LogoItem = {
  id: string;
  name: string;
  /// null : pas de logo fourni, le nom tient lieu de logo.
  logo: string | null;
};

type LogoGridProps = {
  items: readonly LogoItem[];
  size?: "md" | "lg";
};

const GRID_CLASSES = {
  md: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6",
  lg: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
} as const;

/// Mur de logos sur tuiles blanches : les logos sont prévus pour un fond
/// clair, quel que soit le thème.
export function LogoGrid({ items, size = "md" }: LogoGridProps) {
  return (
    <ul className={`grid gap-3 ${GRID_CLASSES[size]}`}>
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-2">
          <div className="relative grid aspect-square place-items-center overflow-hidden rounded-3xl border border-line bg-white p-4">
            {item.logo ? (
              <Image src={item.logo} alt="" fill sizes="(min-width: 1024px) 200px, 45vw" className="object-contain p-4" />
            ) : (
              <span className="text-center font-display text-2xl leading-tight text-[#1f1329]">{item.name}</span>
            )}
          </div>
          <span className="text-sm leading-snug text-muted">{item.name}</span>
        </li>
      ))}
    </ul>
  );
}
