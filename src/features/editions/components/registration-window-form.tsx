"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButton } from "@/components/admin/admin-button";
import { AdminTextField } from "@/components/admin/admin-text-field";
import { updateRegistrationWindowAction } from "@/features/editions/admin-actions";
import {
  registrationWindowSchema,
  type RegistrationWindowInput,
} from "@/features/editions/admin-schemas";

export function RegistrationWindowForm({ initialValues }: { initialValues: RegistrationWindowInput }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<RegistrationWindowInput>({
    resolver: zodResolver(registrationWindowSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: RegistrationWindowInput): Promise<void> {
    setFeedback(null);
    const result = await updateRegistrationWindowAction(values);
    if (!result.ok) {
      setFeedback({ tone: "error", text: result.error.message });
      return;
    }
    reset(values);
    setFeedback({ tone: "success", text: "Fenêtre d'inscription enregistrée." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {feedback ? <AdminAlert tone={feedback.tone}>{feedback.text}</AdminAlert> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminTextField
          label="Ouverture des inscriptions"
          type="datetime-local"
          hint="Heure de Paris."
          error={errors.opensAt?.message}
          {...register("opensAt")}
        />
        <AdminTextField
          label="Fermeture des inscriptions"
          type="datetime-local"
          hint="Heure de Paris."
          error={errors.closesAt?.message}
          {...register("closesAt")}
        />
      </div>
      <AdminButton type="submit" variant="primary" isLoading={isSubmitting} disabled={!isDirty} className="self-start">
        Enregistrer la fenêtre
      </AdminButton>
    </form>
  );
}
