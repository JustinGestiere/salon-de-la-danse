import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries";
import { LOGIN_PATH, getHomePath } from "@/features/auth/redirects";

export default async function HomePage() {
  const user = await getSessionUser();
  if (!user) redirect(LOGIN_PATH);

  redirect(getHomePath(user.role));
}
