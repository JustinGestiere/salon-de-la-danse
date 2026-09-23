import { describe, expect, it } from "vitest";

import { passwordResetSchema } from "./schemas";

const VALID_RESET = {
  token: "abc123",
  password: "NouveauMotDePasse1",
  confirmPassword: "NouveauMotDePasse1",
};

describe("passwordResetSchema", () => {
  it("accepts a strong password confirmed twice", () => {
    expect(passwordResetSchema.safeParse(VALID_RESET).success).toBe(true);
  });

  it("rejects a confirmation that differs from the password", () => {
    const result = passwordResetSchema.safeParse({ ...VALID_RESET, confirmPassword: "Autre123456" });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });

  it("rejects a password weaker than the registration rules", () => {
    const result = passwordResetSchema.safeParse({
      ...VALID_RESET,
      password: "motdepasse",
      confirmPassword: "motdepasse",
    });

    expect(result.success).toBe(false);
  });
});
