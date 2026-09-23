"use client";

import { AdminRouteError } from "@/components/admin/admin-route-error";

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <AdminRouteError {...props} />;
}
