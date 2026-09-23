"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButton } from "@/components/admin/admin-button";
import { AdminTextArea } from "@/components/admin/admin-text-area";
import { AdminTextField } from "@/components/admin/admin-text-field";
import { updateWelcomeAction } from "@/features/editions/admin-actions";
import { MAX_RULES_LENGTH, welcomeSchema, type WelcomeInput } from "@/features/editions/admin-schemas";
import { WelcomePreview } from "@/features/editions/components/welcome-preview";

type WelcomeFormProps = {
  initialValues: WelcomeInput;
  editionName: string;
};

export function WelcomeForm({ initialValues, editionName }: WelcomeFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<WelcomeInput>({ resolver: zodResolver(welcomeSchema), defaultValues: initialValues });
  const [rulesMarkdown, contactEmail, contactPhone] = useWatch({
    control,
    name: ["rulesMarkdown", "contactEmail", "contactPhone"],
  });

  async function onSubmit(values: WelcomeInput): Promise<void> {
    setFeedback(null);
    const result = await updateWelcomeAction(values);
    if (!result.ok) {
      setFeedback({ tone: "error", text: result.error.message });
      return;
    }
    reset(values);
    setFeedback({ tone: "success", text: "Textes d'accueil enregistrés." });
    router.refresh();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <p className="text-sm leading-relaxed text-muted">
          Ces textes s'affichent au bénévole à sa première connexion, avant qu'il compose son planning.
        </p>
        {feedback ? <AdminAlert tone={feedback.tone}>{feedback.text}</AdminAlert> : null}
        <AdminTextArea
          label="Règles d'engagement"
          rows={8}
          maxLength={MAX_RULES_LENGTH}
          hint="Ponctualité, tenue, consignes de sécurité. Mise en forme Markdown acceptée."
          error={errors.rulesMarkdown?.message}
          {...register("rulesMarkdown")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminTextField
            label="E-mail de l'équipe"
            type="email"
            autoComplete="off"
            error={errors.contactEmail?.message}
            {...register("contactEmail")}
          />
          <AdminTextField
            label="Téléphone de l'équipe"
            type="tel"
            autoComplete="off"
            error={errors.contactPhone?.message}
            {...register("contactPhone")}
          />
        </div>
        <AdminButton type="submit" variant="primary" isLoading={isSubmitting} disabled={!isDirty} className="self-start">
          Enregistrer les textes
        </AdminButton>
      </form>
      <WelcomePreview
        editionName={editionName}
        rulesMarkdown={rulesMarkdown}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
      />
    </div>
  );
}
