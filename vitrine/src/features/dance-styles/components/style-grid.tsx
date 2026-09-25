import { DANCE_STYLES, STYLE_FORMAT_LABELS, type StyleFormat } from "@/features/dance-styles/content";

const FORMAT_TAG_CLASSES: Record<StyleFormat, string> = {
  solo: "bg-lilac-soft text-lilac-ink",
  duo: "bg-warn-soft text-warn-ink",
  group: "bg-ok-soft text-ok-ink",
};

export function StyleGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {DANCE_STYLES.map((style) => (
        <li key={style.id} className="flex flex-col gap-3 rounded-3xl border border-line-strong p-7">
          <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${FORMAT_TAG_CLASSES[style.format]}`}>
            {STYLE_FORMAT_LABELS[style.format]}
          </span>
          <h3 className="font-display text-4xl leading-none text-ink">{style.name}</h3>
          <p className="text-[15px] leading-relaxed text-muted">{style.pitch}</p>
        </li>
      ))}
    </ul>
  );
}
