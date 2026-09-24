import { describe, expect, it } from "vitest";

import { buildInvitationEmail, buildInvitationLink } from "./invitation-email";

describe("buildInvitationLink", () => {
  it("opens the registration page with the code already filled in", () => {
    expect(buildInvitationLink("https://salon.example", "INV-AB12CD")).toBe(
      "https://salon.example/inscription?code=INV-AB12CD",
    );
  });
});

describe("buildInvitationEmail", () => {
  it("gives the code and the registration link to the selected candidate", () => {
    const email = buildInvitationEmail({
      to: "marie@example.org",
      appUrl: "https://salon.example",
      code: "INV-AB12CD",
      editionName: "Salon de la Danse 2027",
      expiresAt: null,
    });

    expect(email.to).toBe("marie@example.org");
    expect(email.subject).toContain("Salon de la Danse 2027");
    expect(email.text).toContain("INV-AB12CD");
    expect(email.html).toContain('href="https://salon.example/inscription?code=INV-AB12CD"');
  });
});
