import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => ({
  isMailerConfigured: vi.fn(() => true),
  trySendMail: vi.fn(async () => true),
  listCampaignRecipients: vi.fn(async () => [
    { volunteerId: "vol-1", email: "marie@example.org", firstName: "Marie" },
    { volunteerId: "vol-2", email: "jean@example.org", firstName: "Jean" },
  ]),
  auditCreate: vi.fn(async () => ({})),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ env: { NEXT_PUBLIC_APP_URL: "https://salon.example" } }));
vi.mock("@/lib/mailer", () => ({
  isMailerConfigured: fake.isMailerConfigured,
  trySendMail: fake.trySendMail,
}));
vi.mock("@/lib/db", () => ({ db: { auditLog: { create: fake.auditCreate } } }));
vi.mock("@/features/notifications/queries", () => ({
  listCampaignRecipients: fake.listCampaignRecipients,
  listLockedSchedules: vi.fn(async () => new Map()),
}));

const { sendReminderCampaign } = await import("./reminder-service");

const INPUT = {
  edition: {
    id: "ed-1",
    name: "Salon 2027",
    registrationClosesAt: new Date("2027-04-30T16:00:00Z"),
    contactEmail: null,
  },
  campaign: "draftPlanning" as const,
  actorId: "admin-1",
};

beforeEach(() => {
  vi.clearAllMocks();
  fake.isMailerConfigured.mockReturnValue(true);
  fake.trySendMail.mockResolvedValue(true);
});

describe("sendReminderCampaign", () => {
  it("keeps sending after a failure and reports both counts", async () => {
    fake.trySendMail.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    const report = await sendReminderCampaign(INPUT);

    expect(report).toEqual({ total: 2, sent: 1, failed: 1 });
    expect(fake.auditCreate).toHaveBeenCalledOnce();
  });

  it("refuses to start when SMTP is not configured", async () => {
    fake.isMailerConfigured.mockReturnValue(false);

    await expect(sendReminderCampaign(INPUT)).rejects.toMatchObject({ code: "mail.unavailable" });
    expect(fake.trySendMail).not.toHaveBeenCalled();
  });

  it("does not log a campaign in the audit trail when nothing was sent", async () => {
    fake.trySendMail.mockResolvedValue(false);

    await sendReminderCampaign(INPUT);

    expect(fake.auditCreate).not.toHaveBeenCalled();
  });
});
