"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButton } from "@/components/admin/admin-button";
import { AdminTextArea } from "@/components/admin/admin-text-area";
import { AdminTextField } from "@/components/admin/admin-text-field";
import { MAX_CODES_PER_BATCH } from "@/features/invitations/constants";
import { generateInvitationsAction } from "@/features/invitations/actions";
import {
  generateInvitationsSchema,
  splitEmailList,
  type GenerateInvitationsFormValues,
  type GenerateInvitationsInput,
} from "@/features/invitations/schemas";

const DEFAULT_VALUES: GenerateInvitationsFormValues = { count: 10, emails: "", expiresAt: "" };

function describeGeneration({ created, sent, failed }: { created: number; sent: number; failed: number }): string {
  const generated = `${created} code${created > 1 ? "s" : ""} généré${created > 1 ? "s" : ""}`;
  if (sent + failed === 0) return `${generated}.`;
  const delivered = `${sent} e-mail${sent > 1 ? "s" : ""} envoyé${sent > 1 ? "s" : ""}`;
  if (failed === 0) return `${generated}, ${delivered}.`;
  return `${generated}, ${delivered}. ${failed} envoi${failed > 1 ? "s" : ""} en échec : utilisez « Renvoyer » dans le registre.`;
}

function pluralizeCodes(count: number): string {
  return count > 1 ? "codes à émettre" : "code à émettre";
}

export function GenerateCodesForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<GenerateInvitationsFormValues, unknown, GenerateInvitationsInput>({
    resolver: zodResolver(generateInvitationsSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const [emails, count] = useWatch({ control, name: ["emails", "count"] });
  const emailCount = splitEmailList(emails).length;
  const anonymousCount = Number(count) || 0;
  const codeCount = emailCount > 0 ? emailCount : anonymousCount;

  async function onSubmit(values: GenerateInvitationsInput): Promise<void> {
    setFormError(null);
    setSuccessMessage(null);

    const result = await generateInvitationsAction(values);
    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }

    setSuccessMessage(describeGeneration(result.data));
    reset(DEFAULT_VALUES);
    router.refresh();
  }

  return (
    <section
      aria-labelledby="generate-codes-title"
      className="relative flex flex-col rounded-3xl border border-line bg-surface"
    >
      <div aria-hidden="true" className="bg-sunset mx-6 h-[3px] rounded-b-full" />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col">
        <div className="flex flex-col gap-4 p-6 pb-5">
          <h2 id="generate-codes-title" className="font-display text-3xl text-ink">
            Émettre des codes
          </h2>
          {formError ? <AdminAlert tone="error">{formError}</AdminAlert> : null}
          {successMessage ? <AdminAlert tone="success">{successMessage}</AdminAlert> : null}

          <AdminTextArea
            label="E-mails des candidats retenus"
            rows={5}
            placeholder={"marie.dupont@example.com\njean.martin@example.com"}
            className="font-code text-[13px]"
            hint="Une adresse par ligne, collée depuis l'export du formulaire externe. Laissez vide pour des codes anonymes."
            error={errors.emails?.message}
            {...register("emails")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminTextField
              label="Codes anonymes"
              type="number"
              min={1}
              max={MAX_CODES_PER_BATCH}
              disabled={emailCount > 0}
              hint={emailCount > 0 ? "Ignoré : un code par adresse." : undefined}
              error={errors.count?.message}
              {...register("count")}
            />
            <AdminTextField
              label="Expiration (facultatif)"
              type="date"
              error={errors.expiresAt?.message}
              {...register("expiresAt")}
            />
          </div>
        </div>

        <div aria-hidden="true" className="relative mx-6 border-t border-dashed border-line-strong">
          <span className="absolute -left-9 -top-3 size-6 rounded-full border-r border-line bg-canvas" />
          <span className="absolute -right-9 -top-3 size-6 rounded-full border-l border-line bg-canvas" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-6 pt-5">
          <p aria-live="polite" className="flex items-baseline gap-2">
            <span className="font-display text-5xl leading-none text-accent-strong">{codeCount}</span>
            <span className="text-sm text-muted">{pluralizeCodes(codeCount)}</span>
          </p>
          <AdminButton type="submit" variant="primary" isLoading={isSubmitting} disabled={codeCount === 0}>
            Générer les codes
          </AdminButton>
        </div>
      </form>
    </section>
  );
}
