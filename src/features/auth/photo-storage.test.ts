import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it, vi } from "vitest";

const uploadDir = await mkdtemp(path.join(tmpdir(), "salon-photos-"));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ env: { UPLOAD_DIR: uploadDir } }));

const { storeVolunteerPhoto } = await import("./photo-storage");

afterAll(async () => {
  await rm(uploadDir, { recursive: true, force: true });
});

describe("storeVolunteerPhoto", () => {
  it("writes the photo in the upload directory, named after the volunteer", async () => {
    const photo = new File(["photo-bytes"], "moi.png", { type: "image/png" });

    const photoPath = await storeVolunteerPhoto("vol-1", photo);

    expect(photoPath).toBe(path.join(uploadDir, "vol-1.png"));
    expect(await readFile(photoPath, "utf8")).toBe("photo-bytes");
  });
});
