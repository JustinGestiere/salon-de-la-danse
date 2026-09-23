"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { requestPasswordResetAction } from "@/features/auth/password-reset-actions";
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from "@/features/auth/constants";
import { LOGIN_PATH } from "@/features/auth/redirects";
import {
  passwordResetRequestSchema,
  type PasswordResetRequestInput,
} from "@/features/auth/schemas";

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestInput>({ resolver: zodResolver(passwordResetRequestSchema) });

  async function onSubmit(values: PasswordResetRequestInput): Promise<void> {
    setFormError(null);
    const result = await requestPasswordResetAction(values);
    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }
    setIsSent(true);
  }

  if (isSent) {
    return (
      <div className="flex flex-col gap-5">
        <Alert tone="success">
          Si un compte correspond à cette adresse, un e-mail vient de vous être envoyé. Le lien
          qu'il contient est valable {PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes. Pensez à vérifier
          vos courriers indésirables.
        </Alert>
        <BackToLoginLink />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {formError ? <Alert tone="error">{formError}</Alert> : null}
      <TextField
        label="E-mail"
        type="email"
        autoComplete="email"
        hint="L'adresse utilisée lors de votre inscription."
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
        Recevoir un lien
      </Button>
      <BackToLoginLink />
    </form>
  );
}

function BackToLoginLink() {
  return (
    <Link href={LOGIN_PATH} className="text-sm font-medium text-accent underline-offset-4 hover:underline">
      ← Retour à la connexion
    </Link>
  );
}
