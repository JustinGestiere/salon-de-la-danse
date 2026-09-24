import { describe, expect, it } from "vitest";

import { prefixSvgIds, toSvgIdPrefix } from "./fluent-icon-ids";

describe("prefixSvgIds", () => {
  it("prefixes gradient ids and every reference to them", () => {
    const body =
      '<path fill="url(#grad)"/><use href="#grad"/><defs><linearGradient id="grad"/></defs>';

    expect(prefixSvgIds(body, "p1-")).toBe(
      '<path fill="url(#p1-grad)"/><use href="#p1-grad"/><defs><linearGradient id="p1-grad"/></defs>',
    );
  });
});

describe("toSvgIdPrefix", () => {
  it("strips characters that would break an url(#…) reference", () => {
    expect(toSvgIdPrefix("«r1:a»")).toBe("fir1a-");
  });
});
