"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButton } from "@/components/admin/admin-button";
import { AdminTextField } from "@/components/admin/admin-text-field";
import { createEditionAction } from "@/features/editions/admin-actions";
import { createEditionSchema, type CreateEditionInput } from "@/features/editions/admin-schemas";

type CreateEditionFormProps = {
  initialValues: CreateEditionInput;
  /// Édition reprise comme modèle : celle en cours, sinon la dernière archivée.
  /// Null s'il n'en existe aucune.
  templateEditionName: string | null;
  /// Faux quand le modèle est déjà archivé.
  canArchiveTemplate: boolean;
};

type CheckboxOption = { name: "copyGrid" | "copyWelcome" | "archiveCurrent"; label: string };

const COPY_OPTIONS: readonly CheckboxOption[] = [
  { name: "copyGrid", label: "Reprendre missions, créneaux et jauges" },
  { name: "copyWelcome", label: "Reprendre les textes d'accueil" },
  { name: "archiveCurrent", label: "Archiver l'édition en cours" },
];

export function CreateEditionForm({ initialValues, templateEditionName, canArchiveTemplate }: CreateEditionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEditionInput>({ resolver: zodResolver(createEditionSchema), defaultValues: initialValues });
  const shouldArchive = useWatch({ control, name: "archiveCurrent" });
  const options = COPY_OPTIONS.filter((option) => {
    if (!templateEditionName) return false;
    return option.name !== "archiveCurrent" || canArchiveTemplate;
  });

  async function onSubmit(values: CreateEditionInput): Promise<void> {
    setError(null);
    const result = await createEditionAction(values);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.push("/admin/reglages?onglet=inscriptions");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
      <AdminTextField label="Nom" error={errors.name?.message} {...register("name")} />
      <AdminTextField
        label="Identifiant"
        hint="Utilisé dans les adresses, par exemple salon-2028."
        error={errors.slug?.message}
        {...register("slug")}
      />
      <AdminTextField label="Premier jour du salon" type="date" error={errors.firstDay?.message} {...register("firstDay")} />
      <AdminTextField label="Ouverture des inscriptions" type="datetime-local" error={errors.opensAt?.message} {...register("opensAt")} />
      <AdminTextField label="Fermeture des inscriptions" type="datetime-local" error={errors.closesAt?.message} {...register("closesAt")} />
      {options.map((option) => (
        <label key={option.name} className="flex items-center gap-3 text-sm text-ink-soft">
          <input type="checkbox" className="size-[18px] accent-[var(--admin-rose)]" {...register(option.name)} />
          {option.label}
        </label>
      ))}
      {templateEditionName && canArchiveTemplate && shouldArchive ? (
        <AdminAlert tone="warning">
          {templateEditionName} passera en archive : plus d'inscriptions, listes toujours téléchargeables. Ses bénévoles ne sont pas repris.
        </AdminAlert>
      ) : null}
      <AdminButton type="submit" variant="primary" isLoading={isSubmitting} className="self-start">
        Créer l'édition
      </AdminButton>
    </form>
  );
}
