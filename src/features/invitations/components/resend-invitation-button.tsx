import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { resendInvitationAction } from "@/features/invitations/actions";

type ResendInvitationButtonProps = {
  invitationId: string;
};

/// Renvoi du code par e-mail, confirmé en deux temps pour éviter les envois en
/// double sur un clic machinal.
export function ResendInvitationButton({ invitationId }: ResendInvitationButtonProps) {
  return (
    <ConfirmActionButton
      label="Renvoyer"
      confirmLabel="Envoyer l'e-mail"
      variant="secondary"
      action={resendInvitationAction.bind(null, { invitationId })}
    />
  );
}
