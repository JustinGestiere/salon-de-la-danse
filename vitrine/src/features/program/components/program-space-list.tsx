import { PROGRAM_SPACES } from "@/features/program/content";

export function ProgramSpaceList() {
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {PROGRAM_SPACES.map((space) => (
        <li key={space.id} className="flex flex-col gap-3 rounded-[28px] border border-line bg-surface p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lilac">{space.location}</p>
          <h3 className="font-display text-4xl leading-none text-ink">{space.name}</h3>
          <p className="leading-relaxed text-muted">{space.description}</p>
          <p className="mt-auto self-start rounded-full bg-raised px-3 py-1 text-sm text-ink-soft">{space.access}</p>
        </li>
      ))}
    </ul>
  );
}
