"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut(): Promise<void> {
    await signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={handleSignOut} className="text-sm">
      Se déconnecter
    </Button>
  );
}
