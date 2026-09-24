import { FluentIcon } from "@/components/ui/fluent-icon";
import type { RuleViolation, SlotRules } from "@/features/planning/rules";

type RuleChecksProps = {
  slotCount: number;
  rules: SlotRules;
  violations: readonly RuleViolation[];
};

type Check = { key: string; isMet: boolean; text: string };

function buildChecks({ slotCount, rules, violations }: RuleChecksProps): Check[] {
  const failed = new Set(violations.map((violation) => violation.code));
  const slotsLabel = `${slotCount} créneau${slotCount > 1 ? "x" : ""}`;
  return [
    {
      key: "count",
      isMet: !failed.has("tooFew") && !failed.has("tooMany"),
      text: failed.has("tooFew")
        ? `${slotsLabel}, minimum ${rules.minSlots}`
        : `${slotsLabel} sur ${rules.maxSlots} maximum`,
    },
    { key: "overlap", isMet: !failed.has("overlap"), text: "Aucun chevauchement" },
    {
      key: "consecutive",
      isMet: !failed.has("tooManyConsecutive"),
      text: `Pas plus de ${rules.maxConsecutive} créneaux d'affilée`,
    },
  ];
}

/// Règles du cahier des charges vérifiées sur le planning du bénévole. Une
/// dérogation de la régie peut les enfreindre : elles restent alors signalées.
export function RuleChecks(props: RuleChecksProps) {
  return (
    <ul aria-label="Règles du planning" className="flex flex-wrap gap-2">
      {buildChecks(props).map((check) => (
        <li
          key={check.key}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] ${
            check.isMet ? "bg-ok-soft text-ok-ink" : "bg-warn-soft text-warn-ink"
          }`}
        >
          <FluentIcon name={check.isMet ? "checkmark-circle" : "warning"} className="size-4" />
          <span className="sr-only">{check.isMet ? "Respectée :" : "Non respectée :"}</span>
          {check.text}
        </li>
      ))}
    </ul>
  );
}
