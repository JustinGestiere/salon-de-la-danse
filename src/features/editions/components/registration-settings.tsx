import { StatusPill, type StatusTone } from "@/components/admin/status-pill";
import { utcToZonedLocalInput } from "@/features/editions/dates";
import { getEditionStart, isRegistrationOpen, type ActiveEdition } from "@/features/editions/queries";
import { computeRegistrationTimeline } from "@/features/editions/timeline";
import { QuotasForm } from "@/features/editions/components/quotas-form";
import { RegistrationLockCard } from "@/features/editions/components/registration-lock-card";
import { RegistrationTimeline } from "@/features/editions/components/registration-timeline";
import { RegistrationWindowForm } from "@/features/editions/components/registration-window-form";

function describeRegistrationState(edition: ActiveEdition, now: Date): { tone: StatusTone; label: string } {
  if (edition.isRegistrationLocked) return { tone: "danger", label: "Verrouillées" };
  if (isRegistrationOpen(edition, now)) return { tone: "ok", label: "Ouvertes" };
  if (now < edition.registrationOpensAt) return { tone: "warn", label: "Pas encore ouvertes" };
  return { tone: "neutral", label: "Closes" };
}

/// Onglet « Inscriptions et règles » : fenêtre, verrouillage manuel, quotas.
export async function RegistrationSettings({ edition }: { edition: ActiveEdition }) {
  const now = new Date();
  const eventStart = await getEditionStart(edition.id);
  const timeline = computeRegistrationTimeline({
    now,
    opensAt: edition.registrationOpensAt,
    closesAt: edition.registrationClosesAt,
    eventStart,
  });
  const state = describeRegistrationState(edition, now);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
      <div className="flex flex-col gap-6">
        <section aria-labelledby="window-title" className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="window-title" className="font-display text-3xl text-ink">
              Fenêtre d'inscription
            </h2>
            <StatusPill tone={state.tone}>Inscriptions {state.label.toLowerCase()}</StatusPill>
          </div>
          <RegistrationTimeline
            timeline={timeline}
            opensAt={edition.registrationOpensAt}
            closesAt={edition.registrationClosesAt}
            eventStart={eventStart}
            isLocked={edition.isRegistrationLocked}
          />
          <RegistrationWindowForm
            initialValues={{
              opensAt: utcToZonedLocalInput(edition.registrationOpensAt),
              closesAt: utcToZonedLocalInput(edition.registrationClosesAt),
            }}
          />
        </section>
        <RegistrationLockCard isLocked={edition.isRegistrationLocked} />
      </div>
      <section aria-labelledby="rules-title" className="flex flex-col gap-2 self-start rounded-3xl border border-line bg-surface p-7">
        <h2 id="rules-title" className="font-display text-3xl text-ink">
          Règles de planning
        </h2>
        <QuotasForm
          initialQuotas={{
            minSlots: edition.minSlotsPerVolunteer,
            maxSlots: edition.maxSlotsPerVolunteer,
            maxConsecutive: edition.maxConsecutiveSlots,
          }}
        />
      </section>
    </div>
  );
}
