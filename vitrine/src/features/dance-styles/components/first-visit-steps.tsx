import { FIRST_VISIT_STEPS } from "@/features/dance-styles/content";

export function FirstVisitSteps() {
  return (
    <ol className="grid border-t border-line-strong md:grid-cols-2 lg:grid-cols-4">
      {FIRST_VISIT_STEPS.map((step, index) => (
        <li
          key={step.id}
          className="flex flex-col gap-3 border-b border-line py-7 md:px-7 md:[&:nth-child(odd)]:pl-0 lg:border-b-0 lg:border-l lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
        >
          <span aria-hidden="true" className="font-display text-6xl leading-none text-accent">{index + 1}</span>
          <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
          <p className="text-[15px] leading-relaxed text-muted">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
