import { describe, expect, it } from "vitest";

import { buildAppLink, renderEmail } from "./email-layout";

describe("renderEmail", () => {
  it("escapes names typed by volunteers in the HTML version", () => {
    const email = renderEmail({ greeting: "Bonjour <script>alert(1)</script>,", paragraphs: [] });

    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
  });

  it("lists every section item and the action link in the text version", () => {
    const email = renderEmail({
      greeting: "Bonjour Marie,",
      paragraphs: ["Votre planning est validé."],
      sections: [{ heading: "Samedi 15 mai", items: ["10:00 – 12:00 · Accueil"] }],
      action: { label: "Voir mon récap", url: "https://salon.example/recapitulatif" },
    });

    expect(email.text).toContain("- 10:00 – 12:00 · Accueil");
    expect(email.text).toContain("Voir mon récap : https://salon.example/recapitulatif");
  });
});

describe("buildAppLink", () => {
  it("builds an absolute link on the app domain", () => {
    expect(buildAppLink("https://salon.example", "/inscription?code=INV-ABC")).toBe(
      "https://salon.example/inscription?code=INV-ABC",
    );
  });
});
