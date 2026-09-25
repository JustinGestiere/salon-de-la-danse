import Image from "next/image";

import type { Guest } from "@/features/guests/content";

type GuestCardProps = {
  guest: Guest;
};

export function GuestCard({ guest }: GuestCardProps) {
  return (
    <article className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-line bg-raised">
        {guest.photo ? (
          <Image
            src={guest.photo.src}
            alt={guest.photo.alt}
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
            className={`object-cover ${guest.photo.focus === "top" ? "object-top" : "object-center"}`}
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center font-display text-8xl text-lilac">
            {guest.names.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{guest.discipline}</p>
        <h2 className="font-display text-3xl leading-tight text-ink">{guest.names}</h2>
        <p className="text-[15px] leading-relaxed text-muted">{guest.bio}</p>
      </div>
    </article>
  );
}
