import { describe, expect, it } from "vitest";

import { suggestFirstEdition, suggestNextEdition, toEditionSlug } from "@/features/editions/next-edition";
import { zonedLocalToUtc } from "@/features/editions/dates";

const SOURCE = {
  name: "Salon de la Danse 2027",
  firstDay: "2027-05-14",
  opensAt: zonedLocalToUtc("2027-03-01T09:00"),
  closesAt: zonedLocalToUtc("2027-04-30T23:59"),
};

describe("suggestNextEdition", () => {
  it("keeps the same weekday one year later", () => {
    const suggestion = suggestNextEdition(SOURCE, "2027-06-01");

    expect(suggestion.firstDay).toBe("2028-05-12");
    expect(new Date(`${suggestion.firstDay}T00:00:00Z`).getUTCDay()).toBe(new Date("2027-05-14T00:00:00Z").getUTCDay());
  });

  it("shifts the registration window while keeping the Paris wall-clock time", () => {
    const suggestion = suggestNextEdition(SOURCE, "2027-06-01");

    expect(suggestion.opensAt).toBe("2028-02-28T09:00");
    expect(suggestion.closesAt).toBe("2028-04-28T23:59");
  });

  it("replaces the year in the name and derives the slug", () => {
    const suggestion = suggestNextEdition(SOURCE, "2027-06-01");

    expect(suggestion.name).toBe("Salon de la Danse 2028");
    expect(suggestion.slug).toBe("salon-de-la-danse-2028");
  });

  it("starts from today when the source has no time slots yet", () => {
    const suggestion = suggestNextEdition({ ...SOURCE, firstDay: null }, "2027-06-01");

    expect(suggestion.firstDay).toBe("2028-05-30");
  });
});

describe("toEditionSlug", () => {
  it("strips accents and punctuation", () => {
    expect(toEditionSlug("  Édition spéciale : Angers !  ")).toBe("edition-speciale-angers");
  });
});

describe("suggestFirstEdition", () => {
  it("closes registrations two weeks before the first day, without copying anything", () => {
    const suggestion = suggestFirstEdition("2027-06-01");

    expect(suggestion.firstDay).toBe("2028-05-30");
    expect(suggestion.closesAt).toBe("2028-05-16T23:59");
    expect(suggestion.copyGrid).toBe(false);
  });
});
