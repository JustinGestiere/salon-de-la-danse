import { WHY_NOT_YOU_FACTS } from "@/features/dance-styles/content";

export function FactsList() {
  return (
    <ul className="flex flex-col border-t border-line-strong">
      {WHY_NOT_YOU_FACTS.map((fact) => (
        <li key={fact.id} className="grid grid-cols-[110px_minmax(0,1fr)] items-baseline gap-5 border-b border-line-strong py-4 sm:grid-cols-[150px_minmax(0,1fr)]">
          <span className="font-display text-4xl leading-none text-accent sm:text-[44px]">{fact.figure}</span>
          <span className="leading-normal text-ink-soft">{fact.text}</span>
        </li>
      ))}
    </ul>
  );
}
