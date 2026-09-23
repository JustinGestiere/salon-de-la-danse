"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButton } from "@/components/admin/admin-button";
import { AdminTextField } from "@/components/admin/admin-text-field";
import { createMissionAction } from "@/features/editions/admin-actions";
import {
  createMissionSchema,
  type CreateMissionFormValues,
  type CreateMissionInput,
} from "@/features/editions/admin-schemas";
import { MAX_SLOT_CAPACITY } from "@/features/planning/admin-schemas";

const DEFAULT_MISSION_CAPACITY = 4;

const EMPTY_MISSION: CreateMissionFormValues = {
  name: "",
  location: "",
  description: "",
  isSelfBookable: true,
  capacity: DEFAULT_MISSION_CAPACITY,
};

/// Nouvelle mission : une case est créée pour chaque créneau de l'édition,
/// avec la même jauge, à ajuster ensuite dans le planning.
export function CreateMissionForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateMissionFormValues, unknown, CreateMissionInput>({
    resolver: zodResolver(createMissionSchema),
    defaultValues: EMPTY_MISSION,
  });

  async function onSubmit(values: CreateMissionInput): Promise<void> {
    setFeedback(null);
    const result = await createMissionAction(values);
    if (!result.ok) {
      setFeedback({ tone: "error", text: result.error.message });
      return;
    }
    reset(EMPTY_MISSION);
    setFeedback({ tone: "success", text: `Mission « ${values.name} » créée sur tous les créneaux.` });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {feedback ? <AdminAlert tone={feedback.tone}>{feedback.text}</AdminAlert> : null}
      <AdminTextField label="Nom de la mission" error={errors.name?.message} {...register("name")} />
      <AdminTextField label="Lieu" hint="Facultatif, par exemple Hall B." error={errors.location?.message} {...register("location")} />
      <AdminTextField label="Description courte" error={errors.description?.message} {...register("description")} />
      <AdminTextField
        label="Places par créneau"
        type="number"
        inputMode="numeric"
        min={0}
        max={MAX_SLOT_CAPACITY}
        error={errors.capacity?.message}
        {...register("capacity")}
      />
      <label className="flex items-center gap-3 text-sm text-ink-soft">
        <input type="checkbox" className="size-[18px] accent-[var(--admin-rose)]" {...register("isSelfBookable")} />
        Réservable librement par les bénévoles
      </label>
      <p className="text-xs leading-relaxed text-subtle">
        Décochez pour un poste sensible (billetterie, caisse) : seul un admin pourra y attribuer quelqu'un.
      </p>
      <AdminButton type="submit" variant="primary" isLoading={isSubmitting} className="self-start">
        Créer la mission
      </AdminButton>
    </form>
  );
}
