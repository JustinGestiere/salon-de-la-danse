"use client";

import { useState } from "react";
import type { BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { MAX_PHOTO_SIZE_MB } from "@/features/auth/constants";
import { registerAction } from "@/features/auth/actions";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";

/// Les erreurs serveur arrivent indexées par des chaînes : seules celles qui
/// correspondent à un champ du formulaire peuvent être affichées dessous.
function isRegisterField(field: string): field is keyof RegisterInput {
  return Object.hasOwn(registerSchema.shape, field);
}

function appendFields(formData: FormData, values: RegisterInput): void {
  formData.set("invitationCode", values.invitationCode);
  formData.set("firstName", values.firstName);
  formData.set("lastName", values.lastName);
  formData.set("email", values.email);
  formData.set("phone", values.phone);
  formData.set("birthDate", values.birthDate ?? "");
  formData.set("password", values.password);
  formData.set("confirmPassword", values.confirmPassword);
  formData.set("acceptTerms", values.acceptTerms ? "true" : "false");
}

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(
    values: RegisterInput,
    event?: BaseSyntheticEvent,
  ): Promise<void> {
    setFormError(null);
    setPhotoError(null);

    const form = event?.target instanceof HTMLFormElement ? event.target : undefined;
    const photoInput = form?.elements.namedItem("photo");
    const photo =
      photoInput instanceof HTMLInputElement ? photoInput.files?.[0] : undefined;
    if (!photo) {
      setPhotoError("Photo d'identité obligatoire.");
      return;
    }

    const formData = new FormData();
    appendFields(formData, values);
    formData.set("photo", photo);

    const result = await registerAction(formData);
    if (result.ok) {
      router.push("/tableau-de-bord");
      router.refresh();
      return;
    }

    applyServerErrors(result.error.message, result.error.fieldErrors);
  }

  function applyServerErrors(
    message: string,
    fieldErrors: Record<string, string[]> | undefined,
  ): void {
    if (fieldErrors?.photo?.[0]) setPhotoError(fieldErrors.photo[0]);
    if (fieldErrors) {
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (!isRegisterField(field) || messages.length === 0) continue;
        setError(field, { message: messages[0] });
      }
    }
    setFormError(message);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <TextField
        label="Code d'invitation"
        hint="Reçu par e-mail après votre sélection."
        error={errors.invitationCode?.message}
        {...register("invitationCode")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Prénom" autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
        <TextField label="Nom" autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
      </div>

      <TextField label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <TextField label="Téléphone" type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
      <TextField
        label="Date de naissance"
        type="date"
        hint="Nécessaire pour valider la participation des mineurs."
        error={errors.birthDate?.message}
        {...register("birthDate")}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="photo" className="text-sm font-medium text-ink-soft">
          Photo d'identité
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="min-h-11 w-full rounded-2xl border border-line-strong bg-canvas px-4 py-2 text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-raised file:px-3 file:py-1 file:text-sm file:text-ink"
        />
        <p className="text-xs text-subtle">
          Obligatoire pour l'édition du badge. JPEG, PNG ou WebP, {MAX_PHOTO_SIZE_MB} Mo max.
        </p>
        {photoError ? <p className="text-xs font-medium text-danger-ink">{photoError}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Mot de passe" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <TextField label="Confirmer le mot de passe" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input type="checkbox" className="mt-0.5 size-4 accent-[var(--admin-accent)]" {...register("acceptTerms")} />
        <span>
          J'accepte les{" "}
          <Link href="/cgu" className="font-medium text-accent underline-offset-4 hover:underline" target="_blank">
            CGU
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" className="font-medium text-accent underline-offset-4 hover:underline" target="_blank">
            politique de confidentialité (RGPD)
          </Link>
          .
        </span>
      </label>
      {errors.acceptTerms ? (
        <p className="-mt-3 text-xs font-medium text-danger-ink">{errors.acceptTerms.message}</p>
      ) : null}

      <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
        Créer mon compte bénévole
      </Button>

      <p className="text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-medium text-accent underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
