import { describe, expect, it } from "vitest";

import {
  TEMPORARY_PASSWORD_LENGTH,
  generateTemporaryPassword,
} from "@/features/volunteers/temporary-password";

describe("generateTemporaryPassword", () => {
  it("has the expected length", () => {
    expect(generateTemporaryPassword()).toHaveLength(TEMPORARY_PASSWORD_LENGTH);
  });

  it("always contains a lowercase letter, an uppercase letter and a digit", () => {
    const alwaysFirst = (): number => 0;
    const password = generateTemporaryPassword(alwaysFirst);

    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
  });

  it("never uses ambiguous characters", () => {
    const samples = Array.from({ length: 50 }, () => generateTemporaryPassword()).join("");

    expect(samples).not.toMatch(/[lO01]/);
  });
});
