import { resolveAdminContext } from "@/features/admin/guards";
import { getVolunteerPhotoPath } from "@/features/volunteers/admin-queries";
import { readVolunteerPhoto } from "@/features/volunteers/photo-file";

/// Sert la photo d'identité d'un bénévole à la régie (fiche, badges). Les photos
/// sont hors de public/ : aucune n'est accessible sans ce contrôle.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ volunteerId: string }> },
): Promise<Response> {
  const context = await resolveAdminContext();
  if (!context) return new Response(null, { status: 404 });

  const { volunteerId } = await params;
  const photoPath = await getVolunteerPhotoPath(context.edition.id, volunteerId);
  if (!photoPath) return new Response(null, { status: 404 });

  const photo = await readVolunteerPhoto(photoPath);
  if (!photo) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(photo.body), {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
