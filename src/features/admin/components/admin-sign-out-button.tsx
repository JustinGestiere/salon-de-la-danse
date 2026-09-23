"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { signOut } from "@/lib/auth-client";

export function AdminSignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut(): void {
    startTransition(async () => {
      await signOut();
      router.push("/connexion");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="min-h-10 whitespace-nowrap rounded-full px-3 text-sm text-muted transition hover:bg-raised hover:text-ink"
    >
      {isPending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
