type WelcomePreviewProps = {
  editionName: string;
  rulesMarkdown: string;
  contactEmail: string;
  contactPhone: string;
};

/// Aperçu indicatif de l'écran d'accueil bénévole. Le texte reste brut : le
/// rendu Markdown réel appartient à l'espace bénévole.
export function WelcomePreview({ editionName, rulesMarkdown, contactEmail, contactPhone }: WelcomePreviewProps) {
  const contacts = [contactEmail, contactPhone].filter((value) => value.trim() !== "");

  return (
    <aside aria-label="Aperçu côté bénévole" className="flex flex-col gap-3">
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-subtle">Aperçu côté bénévole</span>
      <div className="flex min-h-[420px] flex-col gap-3 rounded-[34px] border border-line bg-canvas px-5 py-7">
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-accent-strong">Bienvenue</span>
        <p className="font-display text-2xl leading-tight text-ink">
          {editionName}
        </p>
        <p className="line-clamp-[10] whitespace-pre-line text-xs leading-relaxed text-muted">
          {rulesMarkdown.trim() === "" ? "Les règles d'engagement apparaîtront ici." : rulesMarkdown}
        </p>
        {contacts.length > 0 ? (
          <div className="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-3.5 text-xs text-ink-soft">
            <span className="font-semibold text-ink">Une question ?</span>
            {contacts.map((contact) => (
              <span key={contact}>{contact}</span>
            ))}
          </div>
        ) : null}
        <span className="mt-auto flex h-11 items-center justify-center rounded-full bg-sunset text-sm font-semibold text-on-accent">
          Composer mon planning
        </span>
      </div>
      <span className="text-center text-[11px] text-subtle">Indicatif : l'écran réel vit dans l'espace bénévole.</span>
    </aside>
  );
}
