import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Route Handler reserve a Better Auth (client externe = le navigateur).
export const { GET, POST } = toNextJsHandler(auth.handler);
