"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { signIn } from "@/lib/auth-client";
import {
  ENTRY_PATH,
  FORGOT_PASSWORD_PATH,
  getSafeRedirectPath,
} from "@/features/auth/redirects";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput): Promise<void> {
    setFormError(null);
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setFormError("E-mail ou mot de passe incorrect.");
      return;
    }
    const next = getSafeRedirectPath(searchParams.get("suivant"), ENTRY_PATH);
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <TextField
        label="E-mail"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="flex flex-col gap-2">
        <TextField
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Link
          href={FORGOT_PASSWORD_PATH}
          className="self-end text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
        Se connecter
      </Button>

      <p className="text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-medium text-accent underline-offset-4 hover:underline">
          S'inscrire avec un code
        </Link>
      </p>
    </form>
  );
}
