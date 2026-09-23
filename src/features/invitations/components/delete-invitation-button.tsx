import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { deleteInvitationAction } from "@/features/invitations/actions";

type DeleteInvitationButtonProps = {
  invitationId: string;
  code: string;
};

/// Un code encore libre peut être supprimé ; un code utilisé reste en base, il
/// relie le bénévole à son invitation.
export function DeleteInvitationButton({ invitationId, code }: DeleteInvitationButtonProps) {
  return (
    <ConfirmActionButton
      label="Supprimer"
      confirmLabel={`Supprimer ${code}`}
      action={deleteInvitationAction.bind(null, { invitationId })}
    />
  );
}
