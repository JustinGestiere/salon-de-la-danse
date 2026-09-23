import Image from "next/image";

type VolunteerPhotoProps = {
  volunteerId: string;
  fullName: string;
  sizes: string;
};

/// Photo servie par la route protégée de la régie. `unoptimized` : l'optimiseur
/// d'images de Next ne transmet pas la session, il ne pourrait pas la lire.
/// `eager` : une image chargée paresseusement hors de l'écran sortirait vide à
/// l'impression des planches.
export function VolunteerPhoto({ volunteerId, fullName, sizes }: VolunteerPhotoProps) {
  return (
    <Image
      src={`/api/admin/volunteers/${volunteerId}/photo`}
      alt={`Photo de ${fullName}`}
      fill
      sizes={sizes}
      unoptimized
      loading="eager"
      className="object-cover"
    />
  );
}
