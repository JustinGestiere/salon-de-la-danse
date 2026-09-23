"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButton } from "@/components/admin/admin-button";
import { AdminTextField } from "@/components/admin/admin-text-field";
import { signIn, signOut } from "@/lib/auth-client";
import { confirmAdminAccessAction } from "@/features/admin/actions";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";

type AdminSignInFormProps = {
  /// Page du back-office à ouvrir une fois connecté, déjà validée côté serveur.
  redirectTo: string;
};

/// Même connexion Better Auth que l'espace bénévole, puis vérification du rôle :
/// un compte bénévole est aussitôt déconnecté avec un message clair.
export function AdminSignInForm({ redirectTo }: AdminSignInFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput): Promise<void> {
    setFormError(null);
    const { error } = await signIn.email({ email: values.email, password: values.password });
    if (error) {
      setFormError("E-mail ou mot de passe incorrect.");
      return;
    }

    const access = await confirmAdminAccessAction();
    if (!access.ok) {
      await signOut();
      setFormError(access.error.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {formError ? <AdminAlert tone="error">{formError}</AdminAlert> : null}
      <AdminTextField
        label="E-mail"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <AdminTextField
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <AdminButton type="submit" variant="primary" isLoading={isSubmitting} className="mt-1 w-full">
        Entrer en régie
      </AdminButton>
    </form>
  );
}
