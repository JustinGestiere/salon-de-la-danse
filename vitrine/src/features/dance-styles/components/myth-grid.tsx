import { MYTHS } from "@/features/dance-styles/content";

export function MythGrid() {
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {MYTHS.map((myth) => (
        <li key={myth.id} className="flex flex-col gap-4 rounded-[28px] border border-line bg-surface p-8 sm:p-9">
          <p className="font-display text-3xl italic leading-tight text-muted sm:text-[34px]">{`«\u00a0${myth.quote}\u00a0»`}</p>
          <p className="text-[17px] leading-relaxed text-ink">{myth.answer}</p>
        </li>
      ))}
    </ul>
  );
}
