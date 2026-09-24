/// Actions tracées au journal. Les deux premières existaient déjà sous forme
/// littérale dans le service des invitations : on reprend les mêmes chaînes.
export const AUDIT_ACTIONS = {
  invitationBatchGenerated: "invitation.batchGenerated",
  invitationDeleted: "invitation.deleted",
  invitationSent: "invitation.sent",
  volunteerProfileUpdated: "volunteer.profileUpdated",
  volunteerPlanningUnlocked: "volunteer.planningUnlocked",
  volunteerPlanningLocked: "volunteer.planningLocked",
  volunteerMinorApproved: "volunteer.minorApproved",
  volunteerPasswordReset: "volunteer.passwordReset",
  volunteerReminderSent: "volunteer.reminderSent",
  assignmentCreated: "assignment.adminCreated",
  assignmentRemoved: "assignment.adminRemoved",
  missionSlotCapacityUpdated: "missionSlot.capacityUpdated",
  missionSlotOpeningUpdated: "missionSlot.openingUpdated",
  missionCreated: "mission.created",
  missionAccessUpdated: "mission.accessUpdated",
  missionCapacityApplied: "mission.capacityApplied",
  editionRegistrationUpdated: "edition.registrationUpdated",
  editionLockUpdated: "edition.lockUpdated",
  editionQuotasUpdated: "edition.quotasUpdated",
  editionWelcomeUpdated: "edition.welcomeUpdated",
  editionCreated: "edition.created",
  editionArchived: "edition.archived",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const AUDIT_CATEGORIES = ["volunteer", "assignment", "grid", "invitation", "edition"] as const;
export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];

export const AUDIT_CATEGORY_LABELS: Record<AuditCategory, string> = {
  volunteer: "Bénévoles",
  assignment: "Affectations",
  grid: "Grille et jauges",
  invitation: "Invitations",
  edition: "Édition",
};

/// Préfixes d'action (avant le point) rattachés à chaque catégorie du journal.
export const AUDIT_CATEGORY_PREFIXES: Record<AuditCategory, readonly string[]> = {
  volunteer: ["volunteer"],
  assignment: ["assignment"],
  grid: ["missionSlot", "mission"],
  invitation: ["invitation"],
  edition: ["edition"],
};

/// Verbe affiché dans le journal, suivi de la cible de l'action.
export const AUDIT_ACTION_SENTENCES: Record<string, string> = {
  [AUDIT_ACTIONS.invitationBatchGenerated]: "a généré des codes d'invitation",
  [AUDIT_ACTIONS.invitationDeleted]: "a supprimé le code",
  [AUDIT_ACTIONS.invitationSent]: "a envoyé par e-mail",
  [AUDIT_ACTIONS.volunteerProfileUpdated]: "a modifié les informations de",
  [AUDIT_ACTIONS.volunteerPlanningUnlocked]: "a déverrouillé le planning de",
  [AUDIT_ACTIONS.volunteerPlanningLocked]: "a reverrouillé le planning de",
  [AUDIT_ACTIONS.volunteerMinorApproved]: "a validé la participation mineure de",
  [AUDIT_ACTIONS.volunteerPasswordReset]: "a réinitialisé le mot de passe de",
  [AUDIT_ACTIONS.volunteerReminderSent]: "a envoyé la relance",
  [AUDIT_ACTIONS.assignmentCreated]: "a affecté",
  [AUDIT_ACTIONS.assignmentRemoved]: "a retiré",
  [AUDIT_ACTIONS.missionSlotCapacityUpdated]: "a modifié la jauge de",
  [AUDIT_ACTIONS.missionSlotOpeningUpdated]: "a changé l'ouverture de",
  [AUDIT_ACTIONS.missionCreated]: "a créé la mission",
  [AUDIT_ACTIONS.missionAccessUpdated]: "a changé l'accès à la mission",
  [AUDIT_ACTIONS.missionCapacityApplied]: "a appliqué une jauge à tous les créneaux de",
  [AUDIT_ACTIONS.editionRegistrationUpdated]: "a modifié la fenêtre d'inscription de",
  [AUDIT_ACTIONS.editionLockUpdated]: "a changé le verrouillage des inscriptions de",
  [AUDIT_ACTIONS.editionQuotasUpdated]: "a modifié les règles de planning de",
  [AUDIT_ACTIONS.editionWelcomeUpdated]: "a modifié les textes d'accueil de",
  [AUDIT_ACTIONS.editionCreated]: "a créé l'édition",
  [AUDIT_ACTIONS.editionArchived]: "a archivé l'édition",
};

export const AUDIT_LOGS_PER_PAGE = 30;
