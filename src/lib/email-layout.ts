/// Mise en page commune des e-mails de l'application. Les messageries (Gmail,
/// Outlook) ignorent les feuilles de style : tout le style est donc écrit en
/// ligne, avec des polices système et une couleur de repli sous le dégradé.

export type EmailSection = {
  heading: string;
  items: readonly string[];
};

export type EmailContent = {
  greeting: string;
  paragraphs: readonly string[];
  sections?: readonly EmailSection[];
  action?: { label: string; url: string };
  /// Petite mention en bas du message (validité d'un lien, message ignoré...).
  footnote?: string;
};

export type RenderedEmail = { html: string; text: string };

const COLORS = {
  page: "#fbf6f1",
  card: "#ffffff",
  line: "#eadfd5",
  ink: "#1f1329",
  inkSoft: "#3a2b48",
  muted: "#5e4f70",
  accent: "#b2456a",
  rose: "#f2668e",
  peach: "#f9a55c",
} as const;

const DISPLAY_FONT = "Georgia, 'Times New Roman', serif";
const BODY_FONT = "Helvetica, Arial, sans-serif";
const SIGNATURE = "L'équipe du Salon de la Danse";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

function renderParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font:15px/1.6 ${BODY_FONT};color:${COLORS.inkSoft};">${escapeHtml(text)}</p>`;
}

function renderSection(section: EmailSection): string {
  const items = section.items
    .map((item) => `<li style="margin:0 0 6px;">${escapeHtml(item)}</li>`)
    .join("");
  return `<p style="margin:20px 0 8px;font:italic 18px/1.3 ${DISPLAY_FONT};color:${COLORS.ink};">${escapeHtml(section.heading)}</p>
<ul style="margin:0 0 8px;padding-left:20px;font:14px/1.5 ${BODY_FONT};color:${COLORS.inkSoft};">${items}</ul>`;
}

function renderAction(action: { label: string; url: string }): string {
  return `<p style="margin:28px 0;"><a href="${escapeHtml(action.url)}" style="display:inline-block;padding:13px 26px;border-radius:999px;background-color:${COLORS.rose};background-image:linear-gradient(90deg,${COLORS.rose},${COLORS.peach});font:bold 15px ${BODY_FONT};color:${COLORS.ink};text-decoration:none;">${escapeHtml(action.label)}</a></p>`;
}

function renderHtml(content: EmailContent): string {
  const sections = (content.sections ?? []).map(renderSection).join("");
  const action = content.action ? renderAction(content.action) : "";
  const footnote = content.footnote
    ? `<p style="margin:24px 0 0;font:13px/1.5 ${BODY_FONT};color:${COLORS.muted};">${escapeHtml(content.footnote)}</p>`
    : "";

  return `<!doctype html>
<html lang="fr"><body style="margin:0;padding:32px 16px;background:${COLORS.page};">
<div style="max-width:560px;margin:0 auto;">
<p style="margin:0 0 20px;font:30px/1 ${DISPLAY_FONT};color:${COLORS.ink};">Salon de la <em style="color:${COLORS.accent};">Danse</em></p>
<div style="background:${COLORS.card};border:1px solid ${COLORS.line};border-radius:24px;padding:32px 28px;">
<p style="margin:0 0 16px;font:15px/1.6 ${BODY_FONT};color:${COLORS.ink};">${escapeHtml(content.greeting)}</p>
${content.paragraphs.map(renderParagraph).join("")}${sections}${action}${footnote}
<p style="margin:24px 0 0;font:15px/1.6 ${BODY_FONT};color:${COLORS.inkSoft};">${escapeHtml(SIGNATURE)}</p>
</div></div></body></html>`;
}

function renderText(content: EmailContent): string {
  const lines = [content.greeting, "", ...content.paragraphs.flatMap((paragraph) => [paragraph, ""])];
  for (const section of content.sections ?? []) {
    lines.push(section.heading, ...section.items.map((item) => `- ${item}`), "");
  }
  if (content.action) lines.push(`${content.action.label} : ${content.action.url}`, "");
  if (content.footnote) lines.push(content.footnote, "");
  lines.push(SIGNATURE);
  return lines.join("\n");
}

/// Produit les versions HTML et texte d'un même message. Tout le contenu est
/// échappé : il peut contenir des noms saisis par les bénévoles.
export function renderEmail(content: EmailContent): RenderedEmail {
  return { html: renderHtml(content), text: renderText(content) };
}

/// Lien absolu vers une page de l'application, pour les boutons des e-mails.
export function buildAppLink(appUrl: string, path: string): string {
  return new URL(path, appUrl).toString();
}
