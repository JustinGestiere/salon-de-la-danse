import { VISIT_MODES } from "@/features/program/content";

export function VisitModes() {
  return (
    <ol className="grid gap-5 md:grid-cols-3">
      {VISIT_MODES.map((mode, index) => (
        <li key={mode.id} className="flex flex-col gap-4 rounded-[28px] border border-line bg-surface p-8">
          <span aria-hidden="true" className="font-display text-4xl text-lilac">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-2xl font-semibold text-ink">{mode.title}</h3>
          <p className="leading-relaxed text-muted">{mode.description}</p>
        </li>
      ))}
    </ol>
  );
}
