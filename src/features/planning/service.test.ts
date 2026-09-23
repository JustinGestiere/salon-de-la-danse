import { beforeEach, describe, expect, it, vi } from "vitest";

type SelectionRow = {
  missionSlotId: string;
  timeSlotId: string;
  missionSlot: { timeSlot: { eventDate: Date; position: number } };
};

type FakeState = {
  /// Ordre des accès à la base, pour vérifier que le verrou précède la lecture.
  calls: string[];
  planningStatus: "DRAFT" | "LOCKED";
  existing: { id: string; source: "SELF" | "ADMIN" } | null;
  selection: SelectionRow[];
};

const fake = vi.hoisted(() => {
  const state: FakeState = { calls: [], planningStatus: "DRAFT", existing: null, selection: [] };
  const tx = {
    $queryRaw: vi.fn(async (sql: TemplateStringsArray) => {
      state.calls.push(sql.join("?").includes("FROM volunteer") ? "lock:volunteer" : "lock:slot");
      return [];
    }),
    volunteer: {
      findUnique: vi.fn(async () => ({ planningStatus: state.planningStatus })),
      update: vi.fn(async () => ({})),
    },
    assignment: {
      findFirst: vi.fn(async () => state.existing),
      findMany: vi.fn(async () => {
        state.calls.push("read:selection");
        return state.selection;
      }),
      delete: vi.fn(async () => ({})),
      count: vi.fn(async () => 0),
      create: vi.fn(async () => ({})),
    },
    missionSlot: {
      findFirst: vi.fn(async () => ({
        id: "ms-new",
        capacity: 10,
        timeSlotId: "ts-new",
        timeSlot: { eventDate: new Date("2027-05-16"), position: 5 },
      })),
    },
  };
  const db = {
    $transaction: vi.fn(async (run: (client: typeof tx) => Promise<unknown>) => run(tx)),
  };
  return { state, tx, db };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: fake.db }));

const { lockPlanning, toggleAssignment } = await import("./service");

const CONTEXT = {
  volunteerId: "vol-1",
  editionId: "ed-1",
  rules: { minSlots: 1, maxSlots: 3, maxConsecutive: 2 },
};

function selectionRow(id: string, date: string, position: number): SelectionRow {
  return {
    missionSlotId: `ms-${id}`,
    timeSlotId: `ts-${id}`,
    missionSlot: { timeSlot: { eventDate: new Date(date), position } },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  fake.state.calls = [];
  fake.state.planningStatus = "DRAFT";
  fake.state.existing = null;
  fake.state.selection = [];
});

describe("toggleAssignment", () => {
  it("removes a post the volunteer booked themselves", async () => {
    fake.state.existing = { id: "as-1", source: "SELF" };

    await expect(toggleAssignment(CONTEXT, "ms-accueil")).resolves.toEqual({ selected: false });
    expect(fake.tx.assignment.delete).toHaveBeenCalledWith({ where: { id: "as-1" } });
  });

  it("locks the volunteer row before reading the current selection", async () => {
    fake.state.selection = [
      selectionRow("a", "2027-05-14", 1),
      selectionRow("b", "2027-05-15", 1),
      selectionRow("c", "2027-05-16", 1),
    ];

    await expect(toggleAssignment(CONTEXT, "ms-new")).rejects.toMatchObject({
      code: "rule.tooMany",
    });
    const lockIndex = fake.state.calls.indexOf("lock:volunteer");
    expect(lockIndex).toBeGreaterThanOrEqual(0);
    expect(lockIndex).toBeLessThan(fake.state.calls.indexOf("read:selection"));
    expect(fake.tx.assignment.create).not.toHaveBeenCalled();
  });

  it("rejects a change once the planning has been locked meanwhile", async () => {
    fake.state.planningStatus = "LOCKED";

    await expect(toggleAssignment(CONTEXT, "ms-new")).rejects.toMatchObject({
      code: "planning.locked",
    });
    expect(fake.tx.assignment.create).not.toHaveBeenCalled();
  });
});

describe("lockPlanning", () => {
  it("validates the selection under the volunteer lock before locking", async () => {
    fake.state.selection = [selectionRow("a", "2027-05-14", 1)];

    await lockPlanning(CONTEXT);

    expect(fake.state.calls).toEqual(["lock:volunteer", "read:selection"]);
    expect(fake.tx.volunteer.update).toHaveBeenCalledOnce();
  });
});
