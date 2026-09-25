import { MALE_ROLE_MODELS } from "@/features/dance-styles/content";

export function RoleModelList() {
  return (
    <ul className="flex flex-col border-t border-line-strong">
      {MALE_ROLE_MODELS.map((person) => (
        <li key={person.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-5">
          <span className="font-display text-3xl leading-tight text-ink sm:text-[34px]">{person.name}</span>
          <span className="text-[15px] text-muted">{person.achievement}</span>
        </li>
      ))}
    </ul>
  );
}
