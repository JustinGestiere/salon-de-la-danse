import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RegisterInput } from "@/features/auth/schemas";

const fake = vi.hoisted(() => {
  const tx = {
    volunteer: { create: vi.fn(async () => ({ id: "vol-1" })) },
    invitationCode: { update: vi.fn(async () => ({})) },
    auditLog: { create: vi.fn(async () => ({})) },
  };
  const db = {
    invitationCode: {
      findUnique: vi.fn(async () => ({
        id: "inv-1",
        editionId: "ed-1",
        email: null,
        expiresAt: null,
        usedAt: null,
        usedByVolunteerId: null,
        edition: { isArchived: false },
      })),
      updateMany: vi.fn(async () => ({ count: 1 })),
    },
    user: {
      update: vi.fn(async () => ({})),
      deleteMany: vi.fn(async () => ({ count: 1 })),
    },
    volunteer: { update: vi.fn(async () => ({})) },
    // Prisma accepte un callback (transaction interactive) ou un tableau de
    // requêtes (transaction séquentielle) : le service utilise les deux.
    $transaction: vi.fn(async (work: unknown) =>
      typeof work === "function" ? work(tx) : Promise.all([work].flat()),
    ),
  };
  const storeVolunteerPhoto = vi.fn(async () => "storage/photos/vol-1.jpg");
  return { db, storeVolunteerPhoto };
});

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/db", () => ({ db: fake.db }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { signUpEmail: vi.fn(async () => ({ user: { id: "user-1" } })) } },
}));
vi.mock("@/features/auth/photo-storage", () => ({
  storeVolunteerPhoto: fake.storeVolunteerPhoto,
}));

const { registerVolunteer } = await import("./service");

const INPUT: RegisterInput = {
  invitationCode: "INV-0001",
  firstName: "Camille",
  lastName: "Bertin",
  email: "camille@example.com",
  phone: "0600000000",
  birthDate: "",
  password: "MotDePasse123",
  confirmPassword: "MotDePasse123",
  acceptTerms: true,
};

const PHOTO = new File(["photo"], "photo.jpg", { type: "image/jpeg" });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("registerVolunteer", () => {
  it("releases the invitation code when the photo cannot be stored", async () => {
    const diskError = new Error("disk full");
    fake.storeVolunteerPhoto.mockRejectedValueOnce(diskError);

    await expect(registerVolunteer(INPUT, PHOTO)).rejects.toBe(diskError);

    expect(fake.db.invitationCode.updateMany).toHaveBeenCalledWith({
      where: { id: "inv-1", usedByVolunteer: { userId: "user-1" } },
      data: { usedAt: null, usedByVolunteerId: null },
    });
    expect(fake.db.user.deleteMany).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  it("keeps the original error when the rollback itself fails", async () => {
    const diskError = new Error("disk full");
    fake.storeVolunteerPhoto.mockRejectedValueOnce(diskError);
    fake.db.user.deleteMany.mockRejectedValueOnce(new Error("connection lost"));
    const logError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(registerVolunteer(INPUT, PHOTO)).rejects.toBe(diskError);

    expect(logError).toHaveBeenCalledOnce();
    logError.mockRestore();
  });
});
