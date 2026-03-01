import { describe, expect, it } from "vitest";

import { groupTasksByStatus } from "./task-board.utils";

describe("groupTasksByStatus", () => {
  it("groups tasks into canonical status buckets", () => {
    const grouped = groupTasksByStatus([
      { id: "1", title: "A", status: "TODO", priority: "LOW" },
      { id: "2", title: "B", status: "DONE", priority: "MEDIUM" }
    ]);

    expect(grouped.TODO).toHaveLength(1);
    expect(grouped.DONE).toHaveLength(1);
    expect(grouped.IN_PROGRESS).toHaveLength(0);
    expect(grouped.IN_REVIEW).toHaveLength(0);
  });
});
