"use client";

import { createAuthClient } from "better-auth/react";

/// Client Better Auth utilise dans les composants clients (connexion,
/// inscription, deconnexion). Il tape sur les Route Handlers montes en
/// /api/auth/*.
const authClient = createAuthClient();

export const { signIn, signOut } = authClient;
