import { describe, expect, it } from "vitest";

import { buildQrMatrix, QR_QUIET_ZONE } from "@/features/badges/qr";

describe("buildQrMatrix", () => {
  it("adds the quiet zone around the symbol", () => {
    const matrix = buildQrMatrix("https://example.com/admin/verification/abc");

    // Un code de version 3 fait 29 modules de côté.
    expect(matrix.size).toBe(29 + QR_QUIET_ZONE * 2);
  });

  it("starts with the top-left finder pattern, right after the quiet zone", () => {
    const matrix = buildQrMatrix("https://example.com/admin/verification/abc");

    expect(matrix.path.startsWith(`M${QR_QUIET_ZONE} ${QR_QUIET_ZONE}h1v1h-1z`)).toBe(true);
  });

  it("encodes different texts differently", () => {
    expect(buildQrMatrix("https://example.com/a").path).not.toBe(buildQrMatrix("https://example.com/b").path);
  });
});
