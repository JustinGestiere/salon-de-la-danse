import type { StatusTone } from "@/components/admin/status-pill";
import type { VolunteerStatus } from "@/features/volunteers/status";

export const VOLUNTEER_STATUS_TONES: Record<VolunteerStatus, StatusTone> = {
  locked: "ok",
  draft: "warn",
  empty: "lilac",
};

/// Pastille de l'avatar dans la liste, teintée par le statut.
export const VOLUNTEER_AVATAR_CLASSES: Record<VolunteerStatus, string> = {
  locked: "bg-ok-soft text-ok-ink",
  draft: "bg-warn-soft text-warn-ink",
  empty: "bg-lilac-soft text-lilac-ink",
};

export const VOLUNTEER_STATUS_TEXT_CLASSES: Record<VolunteerStatus, string> = {
  locked: "text-ok-ink",
  draft: "text-warn-ink",
  empty: "text-lilac-ink",
};

export const VOLUNTEER_STATUS_DOTS: Record<VolunteerStatus, string> = {
  locked: "bg-ok",
  draft: "bg-warn",
  empty: "bg-lilac",
};
