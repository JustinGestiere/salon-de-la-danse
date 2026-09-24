import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => ({
  isMailerConfigured: vi.fn(() => true),
  trySendMail: vi.fn(async () => true),
  updateMany: vi.fn((args: unknown) => ({ op: "updateMany", args })),
  auditCreate: vi.fn((args: unknown) => ({ op: "auditCreate", args })),
  transaction: vi.fn(async (operations: unknown[]) => operations),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ env: { NEXT_PUBLIC_APP_URL: "https://salon.example" } }));
vi.mock("@/lib/mailer", () => ({
  isMailerConfigured: fake.isMailerConfigured,
  trySendMail: fake.trySendMail,
}));
vi.mock("@/lib/db", () => ({
  db: {
    invitationCode: { updateMany: fake.updateMany },
    auditLog: { create: fake.auditCreate },
    $transaction: fake.transaction,
  },
}));

const { sendInvitationEmails } = await import("./email-service");

const INVITATIONS = [
  { id: "inv-1", code: "INV-AAAAAA", email: "marie@example.org", expiresAt: null },
  { id: "inv-2", code: "INV-BBBBBB", email: "jean@example.org", expiresAt: null },
];

const BASE_INPUT = { editionId: "ed-1", editionName: "Salon 2027", actorId: "admin-1" };

beforeEach(() => {
  vi.clearAllMocks();
  fake.isMailerConfigured.mockReturnValue(true);
  fake.trySendMail.mockResolvedValue(true);
});

describe("sendInvitationEmails", () => {
  it("marks only the codes whose e-mail actually left as sent", async () => {
    fake.trySendMail.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const report = await sendInvitationEmails({ ...BASE_INPUT, invitations: INVITATIONS });

    expect(report).toEqual({ sent: 1, failed: 1 });
    expect(fake.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ["inv-1"] } } }),
    );
  });

  it("reports every code as failed without sending when SMTP is not configured", async () => {
    fake.isMailerConfigured.mockReturnValue(false);

    const report = await sendInvitationEmails({ ...BASE_INPUT, invitations: INVITATIONS });

    expect(report).toEqual({ sent: 0, failed: 2 });
    expect(fake.trySendMail).not.toHaveBeenCalled();
  });
});
