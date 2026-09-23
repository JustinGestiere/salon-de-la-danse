"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { resetPasswordAction } from "@/features/auth/password-reset-actions";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/constants";
import { FORGOT_PASSWORD_PATH, LOGIN_PATH } from "@/features/auth/redirects";
import { passwordResetSchema, type PasswordResetInput } from "@/features/auth/schemas";

type ResetPasswordFormProps = {
  /// Jeton lu dans le lien de l'e-mail. Sa validité n'est vérifiée qu'à l'envoi.
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { token },
  });

  async function onSubmit(values: PasswordResetInput): Promise<void> {
    setFormError(null);
    const result = await resetPasswordAction(values);
    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }
    setIsDone(true);
  }

  if (isDone) {
    return (
      <div className="flex flex-col gap-5">
        <Alert tone="success">
          Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter avec le nouveau.
        </Alert>
        <Link
          href={LOGIN_PATH}
          className="bg-sunset inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-on-accent shadow-[0_10px_30px_var(--admin-glow)] transition hover:brightness-105"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {formError ? <Alert tone="error">{formError}</Alert> : null}
      <input type="hidden" {...register("token")} />
      <TextField
        label="Nouveau mot de passe"
        type="password"
        autoComplete="new-password"
        hint={`${MIN_PASSWORD_LENGTH} caractères minimum, avec une minuscule, une majuscule et un chiffre.`}
        error={errors.password?.message}
        {...register("password")}
      />
      <TextField
        label="Confirmer le mot de passe"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
        Enregistrer le mot de passe
      </Button>
      <Link
        href={FORGOT_PASSWORD_PATH}
        className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        Lien expiré ? En demander un nouveau
      </Link>
    </form>
  );
}
