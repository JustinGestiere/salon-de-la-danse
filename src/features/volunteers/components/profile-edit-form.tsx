"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButton } from "@/components/admin/admin-button";
import { AdminTextField } from "@/components/admin/admin-text-field";
import { updateVolunteerProfileAction } from "@/features/volunteers/admin-actions";
import {
  updateVolunteerProfileSchema,
  type UpdateVolunteerProfileInput,
} from "@/features/volunteers/admin-schemas";

const EDITABLE_FIELDS: readonly (keyof UpdateVolunteerProfileInput)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "birthDate",
];

type ProfileEditFormProps = {
  initialValues: UpdateVolunteerProfileInput;
};

/// Correction des informations personnelles par la régie. Le formulaire reste
/// replié tant qu'on ne le demande pas : la fiche est d'abord une lecture.
export function ProfileEditForm({ initialValues }: ProfileEditFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateVolunteerProfileInput>({
    resolver: zodResolver(updateVolunteerProfileSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: UpdateVolunteerProfileInput): Promise<void> {
    setFormError(null);
    const result = await updateVolunteerProfileAction(values);
    if (!result.ok) {
      for (const field of EDITABLE_FIELDS) {
        const message = result.error.fieldErrors?.[field]?.[0];
        if (message) setError(field, { message });
      }
      setFormError(result.error.message);
      return;
    }
    setIsOpen(false);
    router.refresh();
  }

  if (!isOpen) {
    return (
      <AdminButton size="sm" onClick={() => setIsOpen(true)}>
        Modifier les infos
      </AdminButton>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex w-full flex-col gap-4 rounded-3xl border border-line bg-canvas p-5"
    >
      {formError ? <AdminAlert tone="error">{formError}</AdminAlert> : null}
      <input type="hidden" {...register("volunteerId")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminTextField label="Prénom" autoComplete="off" error={errors.firstName?.message} {...register("firstName")} />
        <AdminTextField label="Nom" autoComplete="off" error={errors.lastName?.message} {...register("lastName")} />
        <AdminTextField label="E-mail" type="email" autoComplete="off" error={errors.email?.message} {...register("email")} />
        <AdminTextField label="Téléphone" type="tel" autoComplete="off" error={errors.phone?.message} {...register("phone")} />
        <AdminTextField
          label="Date de naissance"
          type="date"
          hint="Sert à repérer les participations mineures."
          error={errors.birthDate?.message}
          {...register("birthDate")}
        />
      </div>
      <div className="flex gap-2">
        <AdminButton type="submit" variant="primary" isLoading={isSubmitting}>
          Enregistrer
        </AdminButton>
        <AdminButton
          variant="ghost"
          onClick={() => {
            reset(initialValues);
            setFormError(null);
            setIsOpen(false);
          }}
        >
          Annuler
        </AdminButton>
      </div>
    </form>
  );
}
